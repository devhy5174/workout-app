import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import Modal from "../components/ui/Modal";

type Theme = "energy" | "nature" | "cosmo";

const themes: { value: Theme; label: string; color: string }[] = [
  { value: "energy", label: "에너지", color: "bg-orange-500" },
  { value: "nature", label: "자연", color: "bg-green-500" },
  { value: "cosmo", label: "코스모", color: "bg-blue-500" },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { logout } = useUser();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-24">
      <h2 className="text-2xl font-bold text-[var(--color-primary)]">설정</h2>

      <div className="w-full rounded-2xl bg-white shadow p-5 flex flex-col gap-4">
        <p className="font-semibold text-gray-700">테마 선택</p>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`flex-1 flex flex-col items-center gap-2 rounded-xl py-3 border-2 transition ${
                theme === t.value
                  ? "border-[var(--color-primary)]"
                  : "border-transparent"
              }`}
            >
              <span className={`w-8 h-8 rounded-full ${t.color}`} />
              <span className="text-xs text-gray-600">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full rounded-2xl bg-white shadow divide-y">
        {[
          "알림 설정",
          "언어 설정",
          "계정 정보",
          "앱 정보",
          "개인정보 처리방침",
          "이용약관",
          "문의 하기",
        ].map((item) => (
          <button
            key={item}
            className="w-full text-left px-5 py-4 text-gray-700 hover:bg-gray-50 transition"
          >
            {item}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowLogoutModal(true)}
        aria-label="로그아웃"
        className="w-full py-4 rounded-2xl font-bold text-sm text-red-500 bg-white shadow hover:bg-red-50 transition"
      >
        로그아웃
      </button>

      <Modal
        isOpen={showLogoutModal}
        title="로그아웃"
        message="정말 로그아웃 하시겠어요?"
        onConfirm={handleLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
