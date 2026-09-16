import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'

export function NotFoundPage() {
  return (
    <main>
      <PageHero kicker="404" title="Нет такой страницы" />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <Link to="/" className="font-semibold underline underline-offset-4">
          На главную
        </Link>
      </div>
    </main>
  )
}
