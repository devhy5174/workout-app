import { BrowserRouter, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/character" element={<Character />} />
            <Route path="/party" element={<Party />} />
            <Route path="/goal" element={<Goal />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/points" element={<Points />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/workout" element={<Workout />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
