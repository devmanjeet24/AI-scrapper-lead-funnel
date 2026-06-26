import { Route, Routes } from 'react-router-dom'

import { RootLayout } from '@/routes/layouts/RootLayout'
import { RoutePlaceholder } from '@/routes/placeholders/RoutePlaceholder'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<RoutePlaceholder name="home" />} />
        <Route path="login" element={<RoutePlaceholder name="login" />} />
        <Route path="register" element={<RoutePlaceholder name="register" />} />
        <Route path="leads" element={<RoutePlaceholder name="leads" />} />
        <Route path="signals" element={<RoutePlaceholder name="signals" />} />
        <Route
          path="scrape-jobs"
          element={<RoutePlaceholder name="scrape-jobs" />}
        />
        <Route
          path="appointments"
          element={<RoutePlaceholder name="appointments" />}
        />
        <Route path="outreach" element={<RoutePlaceholder name="outreach" />} />
        <Route
          path="*"
          element={<RoutePlaceholder name="not-found" />}
        />
      </Route>
    </Routes>
  )
}
