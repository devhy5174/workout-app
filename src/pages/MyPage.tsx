import { useState } from "react";
import Diet from "./Diet";
import InfoTab from "../components/mypage/InfoTab";
import WorkoutHistoryTab from "../components/mypage/WorkoutHistoryTab";
import StatsTab from "../components/mypage/StatsTab";

type Tab = "info" | "diet" | "workout" | "stats";

const tabs: { id: Tab; label: string }[] = [
  { id: "info", label: "내정보" },
  { id: "diet", label: "식단" },
  { id: "stats", label: "통계" },
  { id: "workout", label: "운동기록" },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("info");

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-t-xl transition-colors ${
              activeTab === t.id
                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                : "text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "info" && <InfoTab />}
        {activeTab === "diet" && <Diet />}
        {activeTab === "workout" && <WorkoutHistoryTab />}
        {activeTab === "stats" && <StatsTab />}
      </div>
    </div>
  );
}
