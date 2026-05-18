import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import BottomNav from "../components/layout/BottomNav";
import Intro from "../pages/Intro";
import Home from "../pages/Home";
import Character from "../pages/onBoarding/ActivityTypePage";
import Party from "../pages/Party";
import Goal from "../pages/Goal";
import Diet from "../pages/Diet";
import Step from "../pages/Step";
import Settings from "../pages/Settings";
import Workout from "../pages/Workout";
import Auth from "../pages/Auth";
import Onboarding from "../pages/onBoarding/Onboarding";
import Community from "../pages/Community";
import PartyDetail from "../pages/PartyDetail";
import MyPage from "../pages/MyPage";
import Admin from "../pages/Admin";
import { useUser } from "../context/UserContext";
import { EventsProvider } from "../context/EventsContext";
import { NoticesProvider } from "../context/NoticesContext";
import LoadingScreen from "../components/ui/LoadingScreen";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
  const { user, userProfile, isLoading } = useUser();

  const introShown = sessionStorage.getItem("intro_shown");
  if (!introShown) {
    sessionStorage.setItem("intro_shown", "1");
    return <Navigate to="/intro" replace />;
  }

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!userProfile) return <LoadingScreen />;
  if (!userProfile.nickname) return <Navigate to="/onboarding" replace />;

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

function IntroGuard() {
  const shown = sessionStorage.getItem("intro_shown");
  if (!shown) {
    sessionStorage.setItem("intro_shown", "1");
    return <Navigate to="/intro" replace />;
  }
  return <Navigate to="/auth" replace />;
}

export default function AppRouter() {
  return (
    <NoticesProvider>
    <EventsProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/intro" element={<Intro />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <Onboarding />
            </AuthGuard>
          }
        />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<Community />} />
          <Route path="/character" element={<Character />} />
          <Route path="/party" element={<Party />} />
          <Route path="/party/:id" element={<PartyDetail />} />
          <Route path="/goal" element={<Goal />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/steps" element={<Step />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/workout" element={<Workout />} />
        </Route>
        <Route path="*" element={<IntroGuard />} />
      </Routes>
    </BrowserRouter>
    </EventsProvider>
    </NoticesProvider>
  );
}
