import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import BottomNav from "./components/layout/BottomNav";
import Home from "./pages/Home";
import Character from "./pages/Character";
import Party from "./pages/Party";
import Goal from "./pages/Goal";
import Diet from "./pages/Diet";
import Points from "./pages/Points";
import Settings from "./pages/Settings";
import Workout from "./pages/Workout";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Community from "./pages/Community";
import MyPage from "./pages/MyPage";
import { useUser } from "./context/UserContext";
import LoadingScreen from "./components/ui/LoadingScreen";

// 로그인만 필요 (온보딩 미완료 허용)
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

// 로그인 + 온보딩 완료 필요
function ProtectedLayout() {
  const { user, userProfile, isLoading } = useUser();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!userProfile?.nickname) return <Navigate to="/onboarding" replace />;

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
          <Route path="/goal" element={<Goal />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/points" element={<Points />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/workout" element={<Workout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
