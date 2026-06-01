import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import BottomNav from "../components/layout/BottomNav";
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
import WorkoutDetail from "../components/mypage/WorkoutDetail";
import Admin from "../pages/Admin";
import Achievements from "../pages/Achievements";
import ResetPassword from "../pages/ResetPassword";
import NotificationSettings from "../pages/NotificationSettings";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Terms from "../pages/Terms";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { EventsProvider } from "../context/EventsContext";
import { NoticesProvider } from "../context/NoticesContext";
import LoadingScreen from "../components/ui/LoadingScreen";
import { setFCMNavigate } from "../lib/fcmService";

function FCMNavigateSetup() {
  const navigate = useNavigate();
  useEffect(() => { setFCMNavigate(navigate); }, [navigate]);
  return null;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
  const { user, userProfile, isLoading } = useUser();

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


export default function AppRouter() {
  return (
    <NoticesProvider>
    <EventsProvider>
    <BrowserRouter>
      <FCMNavigateSetup />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
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
          <Route path="/workout/:id" element={<WorkoutDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/workout" element={<Workout />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
    </EventsProvider>
    </NoticesProvider>
  );
}
