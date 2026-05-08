import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Header from "./components/layout/Header";
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
import { useUser } from "./context/UserContext";

function ProtectedLayout() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-4xl animate-bounce">🏃</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

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
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/character" element={<Character />} />
          <Route path="/party" element={<Party />} />
          <Route path="/goal" element={<Goal />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/points" element={<Points />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/workout" element={<Workout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
