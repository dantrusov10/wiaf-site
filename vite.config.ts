import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import { lookupInn } from './server/checkoLookup.ts'

function readUrl(req: IncomingMessage): URL {
  return new URL(req.url ?? '/', 'http://localhost')
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.CHECKO_API_KEY?.trim() ?? ''

  return {
    base: process.env.VITE_BASE || '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'wiaf-checko-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = readUrl(req)
            if (!url.pathname.startsWith('/api/checko')) return next()

            if (url.pathname === '/api/checko/health') {
              return sendJson(res, 200, { ok: true, hasKey: Boolean(apiKey) })
            }

            if (url.pathname === '/api/checko/lookup') {
              if (!apiKey) {
                return sendJson(res, 500, {
                  ok: false,
                  error: 'Нет CHECKO_API_KEY в alt-site/.env.local',
                  inn: '',
                  kind: 'company',
                  light: 'unknown',
                  lightLabel: 'Нет ключа',
                  canRegister: false,
                  companyShort: '',
                  companyFull: '',
                  statusName: '',
                  flags: [],
                  shelves: [],
                  checkedAt: new Date().toISOString(),
                })
              }
              const inn = url.searchParams.get('inn') ?? ''
              try {
                const report = await lookupInn(apiKey, inn)
                return sendJson(res, report.ok || report.kind === 'demo' ? 200 : 404, report)
              } catch (e) {
                return sendJson(res, 502, {
                  ok: false,
                  error: e instanceof Error ? e.message : 'Checko proxy error',
                  inn,
                  kind: 'company',
                  light: 'unknown',
                  lightLabel: 'Ошибка',
                  canRegister: false,
                  companyShort: '',
                  companyFull: '',
                  statusName: '',
                  flags: [],
                  shelves: [],
                  checkedAt: new Date().toISOString(),
                })
              }
            }

            return sendJson(res, 404, { error: 'Unknown checko route' })
          })
        },
      },
    ],
    server: {
      port: 5173,
      strictPort: true,
      host: '127.0.0.1',
    },
  }
})
