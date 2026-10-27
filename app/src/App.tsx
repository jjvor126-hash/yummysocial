import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { BottomNav } from './components/BottomNav'
import { Placeholder } from './components/Placeholder'
import { ScrollToTop } from './components/ScrollToTop'
import { Feed } from './screens/Feed'
import { NotFound } from './screens/NotFound'
import { Onboarding } from './screens/Onboarding'
import { Settings } from './screens/Settings'
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
            <Route
              path="/search"
              element={
                <Placeholder
                  title="Explorar"
                  description="Busca recetas por nombre, tiempo de preparación o dificultad."
                  icon="search"
                  phase="Fase 4"
                />
              }
            />
            <Route
              path="/saved"
              element={
                <Placeholder
                  title="Guardadas"
                  description="Tus recetas favoritas, organizadas por categoría."
                  icon="bookmark"
                  phase="Fase 4"
                />
              }
            />
            <Route
              path="/profile"
              element={
                <Placeholder
                  title="Mi perfil"
                  description="Tus recetas, historias destacadas, seguidores y logros culinarios."
                  icon="person"
                  phase="Fase 3"
                />
              }
            />
          </Route>

          <Route
            path="/create"
            element={
              <Placeholder
                standalone
                backTo="/feed"
                title="Crear receta"
                description="Añade foto, ingredientes y pasos para publicar tu receta."
                icon="add_circle"
                phase="Fase 3"
              />
            }
          />

          <Route
            path="/recipe/:id"
            element={
              <Placeholder
                standalone
                backTo="/feed"
                title="Detalle de receta"
                description="Ingredientes, preparación, dificultad y comentarios de la comunidad."
                icon="restaurant"
                phase="Fase 2"
              />
            }
          />

          <Route
            path="/notifications"
            element={
              <Placeholder
                standalone
                backTo="/feed"
                title="Notificaciones"
                description="Likes, comentarios, seguidores y novedades de la app."
                icon="notifications"
                phase="Fase 4"
              />
            }
          />

          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
