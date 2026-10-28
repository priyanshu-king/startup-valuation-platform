/**
 * App — React Router Configuration
 * ==================================
 * Public marketing routes, the existing valuation flow, compatibility health
 * dashboard, and a private founder workspace with explicit feature availability.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

import LandingPage   from '@/pages/LandingPage'
import ValuationPage from '@/pages/ValuationPage'
import DashboardPage from '@/pages/DashboardPage'
import NotFoundPage  from '@/pages/NotFoundPage'
import PublicLayout from '@/components/layout/PublicLayout'
import WorkspaceLayout from '@/components/layout/WorkspaceLayout'
import WorkspacePage from '@/pages/WorkspacePage'
import ContentPage from '@/pages/ContentPage'
import FinancialPlanner from '@/components/workspace/FinancialPlanner'
import RunwayCalculator from '@/components/workspace/RunwayCalculator'
import FundraisingCalculator from '@/components/workspace/FundraisingCalculator'
import CapTable from '@/components/workspace/CapTable'
import InvestorReadiness from '@/components/workspace/InvestorReadiness'
import Reports from '@/components/workspace/Reports'
import Settings from '@/components/workspace/Settings'
import RoadmapLandingPage from '@/pages/RoadmapLandingPage'
import RoadmapWizardPage from '@/pages/RoadmapWizardPage'
import RoadmapWorkspacePage from '@/pages/RoadmapWorkspacePage'
import AuthPage from '@/pages/AuthPage'
import RequireAuth from '@/components/auth/RequireAuth'
import { AuthProvider } from '@/contexts/AuthContext'
import { loadSettings } from '@/services/userSettings'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import ValueStrip from '@/components/landing/ValueStrip'
import ValuationMethods from '@/components/landing/ValuationMethods'
import { FAQSection, PricingSection } from '@/components/landing/PricingAndFAQ'
import '@/components/landing/landing.css'
import '@/components/layout/workspace.css'
import '@/components/roadmap/roadmap.css'

// Toast theme matching the dark brand palette
const TOAST_OPTIONS = {
  style: {
    background: '#1e2535',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  success: { iconTheme: { primary: '#34d399', secondary: '#1e2535' } },
  error:   { iconTheme: { primary: '#f87171', secondary: '#1e2535' } },
}

export default function App() {
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const themePreference = loadSettings().settings.appearance.theme
      const theme = themePreference === 'system'
        ? (media?.matches ? 'dark' : 'light')
        : themePreference
      document.documentElement.dataset.theme = theme
      document.documentElement.style.colorScheme = theme
    }
    applyTheme()
    media?.addEventListener?.('change', applyTheme)
    return () => media?.removeEventListener?.('change', applyTheme)
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
      <AuthProvider>
      <Routes>
        <Route path="/"          element={<LandingPage />}   />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/valuation" element={<RequireAuth><ValuationPage /></RequireAuth>} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route element={<PublicLayout />}>
          <Route path="/roadmap" element={<RoadmapLandingPage />} />
          <Route path="/roadmap/new" element={<RoadmapWizardPage />} />
          <Route path="/features" element={<><Features /><HowItWorks /></>} />
          <Route path="/methodology" element={<ValuationMethods />} />
          <Route path="/sample-report" element={<ValueStrip />} />
          <Route path="/pricing" element={<PricingSection />} />
          <Route path="/about" element={<ContentPage page="about" />} />
          <Route path="/contact" element={<ContentPage page="contact" />} />
          <Route path="/privacy" element={<ContentPage page="privacy" />} />
          <Route path="/terms" element={<ContentPage page="terms" />} />
          <Route path="/faq" element={<FAQSection />} />
        </Route>
        <Route path="/app" element={<RequireAuth><WorkspaceLayout /></RequireAuth>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<WorkspacePage page="overview" />} />
          <Route path="startups" element={<WorkspacePage page="startups" />} />
          <Route path="valuation" element={<ValuationPage embedded />} />
          <Route path="financial-planner" element={<FinancialPlanner />} />
          <Route path="runway" element={<RunwayCalculator />} />
          <Route path="fundraising" element={<FundraisingCalculator />} />
          <Route path="cap-table" element={<CapTable />} />
          <Route path="readiness" element={<InvestorReadiness />} />
          <Route path="reports" element={<Reports />} />
          <Route path="roadmaps" element={<RoadmapWorkspacePage view="list" />} />
          <Route path="roadmaps/:roadmapId/progress" element={<RoadmapWorkspacePage view="progress" />} />
          <Route path="roadmaps/:roadmapId" element={<RoadmapWorkspacePage view="detail" />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/404"       element={<NotFoundPage />}  />
        <Route path="*"          element={<Navigate to="/404" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
