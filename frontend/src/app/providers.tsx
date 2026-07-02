import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { Toaster } from 'sonner'

import { queryClient } from '@/app/query-client'
import { AuthBootstrap } from '@/components/auth/AuthBootstrap'
import { persistor, store } from '@/store'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthBootstrap>
              {children}
            </AuthBootstrap>
            <Toaster position="top-center" richColors closeButton />
            {import.meta.env.DEV ? (
              <ReactQueryDevtools initialIsOpen={false} />
            ) : null}
          </BrowserRouter>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}
