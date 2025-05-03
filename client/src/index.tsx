import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes, useLocation, Navigate, Link } from 'react-router'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/sidebar'
import { useGlobalEvent } from '@/contexts/global-event'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageData, ServerSideProps } from '@/types/server'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const ErrorAlert = lazy(() => import('@/components/layout/error-alert'))
const Home = lazy(() => import("@/pages/home"))
const NotFound = lazy(() => import("@/pages/not-found"))
const SignUp = lazy(() => import("@/pages/sign-up"))
const SignIn = lazy(() => import("@/pages/sign-in"))
const User2Icon = lazy(() => import("lucide-react").then(mod => ({ default: mod.User2Icon })))
const LogInIcon = lazy(() => import("lucide-react").then(mod => ({ default: mod.LogInIcon })))

/**
 * Values in rem
 */
export const MARGIN = 1
export const HEADER_HEIGHT = 2.75

export const Router = ({ props }: { props: ServerSideProps }) => {
  const sendSSRPropsTo = props.serverSideProps.pageData.path;
  const location = useLocation();
  const pageProps = props.serverSideProps.pageData.data as PageData<typeof sendSSRPropsTo>["data"];
  const { user } = useGlobalEvent();
  // const [searchParams] = useSearchParams();
  // const redirectTo = searchParams.get("redirect");

  return (
    <Routes>
      <Route path='/' element={<App internalServerError={{ encountered: props.didEncounterInternalServerError, onPath: props.serverSideProps.pageData.path }} />}>
        <Route path='/' element={<Home pageProps={location.pathname === sendSSRPropsTo ? pageProps as PageData<"/">['data'] : null} />} />
        <Route path='/sign-up' element={!user ? <SignUp /> : <Navigate to={"/"} />} />
        <Route path='/sign-in' element={!user ? <SignIn /> : <Navigate to={"/"} />} />
        <Route path='*' element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function App({ internalServerError }: { internalServerError: { encountered: boolean, onPath: string; } }) {
  const { title, user, userAssets } = useGlobalEvent();
  const location = useLocation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <section className='flex flex-nowrap flex-col w-full h-screen'>
        <header className='my-2 flex items-center' style={{ width: `calc(100% - ${MARGIN}rem)`, height: `${HEADER_HEIGHT}rem` }}>
          <SidebarTrigger style={{ marginLeft: `${MARGIN - 0.35}rem` }} className='has-[>svg]:px-0 py-0 w-8 h-8 [&_svg:not([class*="size-"])]:!size-5' />
          <div className='flex-1 w-full flex justify-end gap-x-6'>
            {/* <SearchModal /> */}

            <Link to={user ? `/profile/${user.id}` : "/sign-in"}>
              <Avatar>
                <AvatarImage src={userAssets ? userAssets.signed_avatar : undefined} alt={user ? user.user_metadata.user_name : undefined} />
                <AvatarFallback>
                  {user ? <User2Icon size={"1.25rem"} /> : <LogInIcon size={"1.25rem"} />}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>
        <Separator />
        <ScrollArea style={{ marginLeft: `${MARGIN}rem`, width: `calc(100% - ${MARGIN}rem)`, height: `calc(100vh - ${HEADER_HEIGHT + (0.5 * 2)}rem)`, paddingTop: `${title ? '0rem' : '0.5rem'}` }}>
          {title && <p className='font-extrabold text-xl py-2'>{title}</p>}

          <Suspense>
            {internalServerError.encountered && internalServerError.onPath === location.pathname ? (
              <section className="w-full flex items-center justify-center" style={{ paddingRight: `${MARGIN}rem` }}>
                <ErrorAlert
                  title="500 - Internal Server Error"
                  error="Something went wrong on our end. We're working to fix it. You can try reloading the page or navigate elsewhere. If the issue persists, please contact support or try again later."
                  retry={{ handler: () => window.location.reload(), title: "Reload Page" }}
                />
              </section>
            ) : (
              <Outlet />
            )}
          </Suspense>
        </ScrollArea>
      </section>
    </SidebarProvider>
  )
}


