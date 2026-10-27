import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { BottomNav } from './components/BottomNav'
import { ScrollToTop } from './components/ScrollToTop'
import { CreateRecipe } from './screens/CreateRecipe'
import { Feed } from './screens/Feed'
import { Leaderboard } from './screens/Leaderboard'
import { NotFound } from './screens/NotFound'
import { Notifications } from './screens/Notifications'
import { Onboarding } from './screens/Onboarding'
import { Profile } from './screens/Profile'
import { RecipeDetail } from './screens/RecipeDetail'
import { Saved } from './screens/Saved'
import { Search } from './screens/Search'
import { Settings } from './screens/Settings'
import { StoryEditor } from './screens/StoryEditor'
import { StoryMediaPicker } from './screens/StoryMediaPicker'
import { StoryPublish } from './screens/StoryPublish'
import { StoryViewer } from './screens/StoryViewer'
import { TopDishes } from './screens/TopDishes'
import { Welcome } from './screens/Welcome'
import { useAppStore } from './store/useAppStore'

function TabLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex min-h-0 flex-1 flex-col pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function HomeRedirect() {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const hasOnboarded = useAppStore((state) => state.hasOnboarded)

  if (!currentUserId) return <Navigate to="/welcome" replace />
  return <Navigate to={hasOnboarded ? '/feed' : '/onboarding'} replace />
}

function WelcomeRoute() {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const hasOnboarded = useAppStore((state) => state.hasOnboarded)

  if (currentUserId) {
    return <Navigate to={hasOnboarded ? '/feed' : '/onboarding'} replace />
  }
  return <Welcome />
}

function OnboardingRoute() {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const hasOnboarded = useAppStore((state) => state.hasOnboarded)

  if (!currentUserId) return <Navigate to="/welcome" replace />
  if (hasOnboarded) return <Navigate to="/feed" replace />
  return <Onboarding />
}

function Protected() {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const hasOnboarded = useAppStore((state) => state.hasOnboarded)

  if (!currentUserId) return <Navigate to="/welcome" replace />
  if (!hasOnboarded) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

export default function App() {
  return (
    <AppShell>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/welcome" element={<WelcomeRoute />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />

        <Route element={<Protected />}>
          <Route element={<TabLayout />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/create" element={<CreateRecipe />} />

          <Route path="/stories/new" element={<StoryMediaPicker />} />
          <Route path="/stories/new/editor" element={<StoryEditor />} />
          <Route path="/stories/new/publish" element={<StoryPublish />} />
          <Route path="/stories/:userId" element={<StoryViewer />} />

          <Route path="/recipe/:id" element={<RecipeDetail />} />

          <Route path="/notifications" element={<Notifications />} />

          <Route path="/leaderboard" element={<Leaderboard />} />

          <Route path="/top-dishes" element={<TopDishes />} />

          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
