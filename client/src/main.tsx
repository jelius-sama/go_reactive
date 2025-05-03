import { JSX, StrictMode } from 'react'
import '@/index.css'
import { BrowserRouter, StaticRouter } from 'react-router'
import { Router } from '@/index'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/contexts/theme'
import { GlobalEventProvider } from '@/contexts/global-event'
import { hydrateRoot } from 'react-dom/client'
import { ServerSideProps } from '@/types/server'
import { ConfigProvider } from '@/contexts/config'

type EntryServer = (props: ServerSideProps) => JSX.Element;
type EntryClient = () => JSX.Element;

let Entry;

if (typeof document === "undefined") {
  const queryClient = new QueryClient()

  Entry = ((props: ServerSideProps) => {
    return (
      <StrictMode>
        <ConfigProvider>
          <StaticRouter location={props.serverSideProps.pageData.path}>
            <QueryClientProvider client={queryClient}>
              <GlobalEventProvider initialUser={props.serverSideProps.user || null} initialUserAssets={props.serverSideProps.userAssets || null}>
                <Router props={props} />
                <Toaster richColors={true} />
              </GlobalEventProvider>
            </QueryClientProvider>
          </StaticRouter>
        </ConfigProvider>
      </StrictMode>
    )
  }) satisfies EntryServer;
} else {
  const windowProps = (window as any).__SERVER_PROPS__ as ServerSideProps;
  const queryClient = new QueryClient()
  let rootEl = document.getElementById('root') as HTMLDivElement | null;

  if (!rootEl) {
    if (process.env.NODE_ENV === "development") {
      throw new Error("Root element not found!")
    } else {
      const div = document.createElement('div');
      div.id = "root"
      document.body.appendChild(div);
      rootEl = div
    }
  }

  Entry = (() => {
    return (
      <StrictMode>
        <BrowserRouter>
          <ConfigProvider>
            <ThemeProvider defaultTheme="dark" storageKey="theme">
              <QueryClientProvider client={queryClient}>
                <GlobalEventProvider initialUser={windowProps.serverSideProps.user} initialUserAssets={windowProps.serverSideProps.userAssets}>
                  <Router props={windowProps} />
                  <Toaster richColors={true} />
                </GlobalEventProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </ConfigProvider>
        </BrowserRouter>
      </StrictMode>
    )
  }) satisfies EntryClient

  hydrateRoot(rootEl, <Entry />)
}


export { Entry };
