import { Route, Routes } from 'react-router-dom'

import { AuthPage } from '@/routes/pages/AuthPage'
import { DashboardPage } from '@/routes/pages/DashboardPage'
import { HomePage } from '@/routes/pages/HomePage'
import { LeadsPage } from '@/routes/pages/LeadsPage'
import { SignalsPage } from '@/routes/pages/SignalsPage'
import { DashboardLayout } from '@/routes/layouts/DashboardLayout'
import { RootLayout } from '@/routes/layouts/RootLayout'
import { RoutePlaceholder } from '@/routes/placeholders/RoutePlaceholder'
import { GuestRoute } from '@/routes/guards/GuestRoute'
import { ProtectedRoute } from '@/routes/guards/ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />

        <Route element={<GuestRoute />}>
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="signals" element={<SignalsPage />} />
            <Route path="scrape-jobs" element={<RoutePlaceholder name="scrape-jobs" />} />
            <Route path="appointments" element={<RoutePlaceholder name="appointments" />} />
            <Route path="outreach" element={<RoutePlaceholder name="outreach" />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<RoutePlaceholder name="not-found" />}
        />
      </Route>
    </Routes>
  )
}
