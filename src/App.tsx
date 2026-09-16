import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Guard } from './app/AppShell'
import {
  ForwarderArchive,
  ForwarderBalance,
  ForwarderChina,
  ForwarderHome,
  ForwarderIndia,
  ForwarderLost,
  ForwarderLot,
  ForwarderMessage,
  ForwarderTurkey,
  ForwarderVietnam,
  ForwarderWon,
} from './app/ForwarderPages'
import {
  ImporterArchive,
  ImporterBids,
  ImporterCreate,
  ImporterCurrent,
  ImporterFailed,
  ImporterHeld,
  ImporterHome,
  ImporterLot,
  ImporterMessage,
  ImporterTemplates,
  ImporterDirector,
} from './app/ImporterPages'
import { NewsDeskPage } from './app/NewsDesk'
import { LoginPage } from './app/LoginPage'
import { RegisterPage } from './app/RegisterPage'
import { SessionProvider } from './app/session'
import { Layout } from './components/Layout'
import { AboutPage } from './pages/AboutPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AuctionLotPage } from './pages/AuctionLotPage'
import { AuctionsPage } from './pages/AuctionsPage'
import { ContactsPage } from './pages/ContactsPage'
import { ContestPage } from './pages/ContestPage'
import { ContestsPage } from './pages/ContestsPage'
import { DirectorPage } from './pages/DirectorPage'
import { FaqPage } from './pages/FaqPage'
import { ForwarderPage } from './pages/ForwarderPage'
import { GuidePage } from './pages/GuidePage'
import { HelpArticlePage, HelpHubPage } from './pages/HelpPage'
import { HomePage } from './pages/HomePage'
import { HowPage } from './pages/HowPage'
import { ImporterPage } from './pages/ImporterPage'
import { NewsArticlePage } from './pages/NewsArticlePage'
import { NewsPage } from './pages/NewsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PricingPage } from './pages/PricingPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { RulesPage } from './pages/RulesPage'
import { ToolsHubPage } from './tools/ToolsHubPage'
import { RoleToolPage, RoleToolsHub } from './tools/RoleToolRoutes'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

const router = createBrowserRouter(
  [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'auctions', element: <AuctionsPage /> },
      { path: 'auctions/:id', element: <AuctionLotPage /> },
      { path: 'tools', element: <ToolsHubPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'guide', element: <GuidePage /> },
      { path: 'help', element: <HelpHubPage /> },
      { path: 'help/:slug', element: <HelpArticlePage /> },
      { path: 'director', element: <DirectorPage /> },
      { path: 'importer', element: <ImporterPage /> },
      { path: 'forwarder', element: <ForwarderPage /> },
      { path: 'how', element: <HowPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'news/:slug', element: <NewsArticlePage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'contests', element: <ContestsPage /> },
      { path: 'contests/:slug', element: <ContestPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contacts', element: <ContactsPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'rules', element: <RulesPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/app/login', element: <LoginPage /> },
  { path: '/app/register', element: <RegisterPage /> },
  { path: '/app/news-desk', element: <NewsDeskPage /> },
  {
    path: '/app/checko',
    element: <Navigate to="/app/login" replace />,
  },
  {
    path: '/app/importer',
    element: <Guard role="importer" />,
    children: [
      { index: true, element: <ImporterHome /> },
      { path: 'tools', element: <RoleToolsHub role="importer" /> },
      { path: 'tools/:slug', element: <RoleToolPage role="importer" /> },
      { path: 'create', element: <ImporterCreate /> },
      { path: 'templates', element: <ImporterTemplates /> },
      { path: 'current', element: <ImporterCurrent /> },
      { path: 'held', element: <ImporterHeld /> },
      { path: 'failed', element: <ImporterFailed /> },
      { path: 'bids', element: <ImporterBids /> },
      { path: 'archive', element: <ImporterArchive /> },
      { path: 'message', element: <ImporterMessage /> },
      { path: 'director', element: <ImporterDirector /> },
      { path: 'lots/:id', element: <ImporterLot /> },
    ],
  },
  {
    path: '/app/forwarder',
    element: <Guard role="forwarder" />,
    children: [
      { index: true, element: <ForwarderHome /> },
      { path: 'tools', element: <RoleToolsHub role="forwarder" /> },
      { path: 'tools/:slug', element: <RoleToolPage role="forwarder" /> },
      { path: 'china', element: <ForwarderChina /> },
      { path: 'turkey', element: <ForwarderTurkey /> },
      { path: 'vietnam', element: <ForwarderVietnam /> },
      { path: 'india', element: <ForwarderIndia /> },
      { path: 'lots/:id', element: <ForwarderLot /> },
      { path: 'won', element: <ForwarderWon /> },
      { path: 'lost', element: <ForwarderLost /> },
      { path: 'archive', element: <ForwarderArchive /> },
      { path: 'balance', element: <ForwarderBalance /> },
      { path: 'message', element: <ForwarderMessage /> },
    ],
  },
  ],
  { basename },
)

export default function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  )
}
