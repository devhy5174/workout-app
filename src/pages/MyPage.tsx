import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

function isValidTab(v: string | null): v is Tab {
  return v === "info" || v === "diet" || v === "workout" || v === "stats";
}

export default function MyPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    isValidTab(initialTab) ? initialTab : "info",
  );

  // hash 기반 섹션 스크롤 (예: #mbti-report)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const tryScroll = (attempts: number) => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts > 0) {
        setTimeout(() => tryScroll(attempts - 1), 150);
      }
    };
    setTimeout(() => tryScroll(5), 100);
  }, [activeTab]);

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
