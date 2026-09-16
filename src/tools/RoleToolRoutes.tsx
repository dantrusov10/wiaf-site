import type { ComponentType } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { AllinToolPage } from './AllinToolPage'
import { AppToolsHub } from './AppToolsHub'
import { CbmToolPage } from './CbmToolPage'
import { CounterpartyToolPage } from './CounterpartyToolPage'
import { DealToolPage } from './DealToolPage'
import { OfferToolPage, RatesToolPage } from './JournalOfferPages'
import { LandedToolPage } from './LandedToolPage'
import { PlanToolPage } from './PlanToolPage'
import { QuotesToolPage } from './QuotesToolPage'
import { SuppliersToolPage } from './SuppliersToolPage'
import { toolsFor, type ToolRole } from './catalog'

const pages: Record<string, ComponentType> = {
  cbm: CbmToolPage,
  landed: LandedToolPage,
  quotes: QuotesToolPage,
  suppliers: SuppliersToolPage,
  counterparty: CounterpartyToolPage,
  deal: DealToolPage,
  plan: PlanToolPage,
  rates: RatesToolPage,
  offer: OfferToolPage,
  allin: AllinToolPage,
}

export function RoleToolsHub({ role }: { role: ToolRole }) {
  return <AppToolsHub role={role} />
}

export function RoleToolPage({ role }: { role: ToolRole }) {
  const { slug } = useParams()
  const allowed = toolsFor(role).some((t) => t.slug === slug)
  if (!slug || !allowed || !pages[slug]) {
    return <Navigate to={role === 'importer' ? '/app/importer/tools' : '/app/forwarder/tools'} replace />
  }
  const Page = pages[slug]
  return <Page />
}
