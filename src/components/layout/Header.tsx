import { useTheme } from "../../context/ThemeContext";

const pageTitles: Record<string, string> = {
  "/": "홈",
  "/character": "캐릭터",
  "/party": "파티",
  "/goal": "목표",
  "/diet": "식단",
  "/settings": "설정",
};

export default function Header() {
  const { theme } = useTheme();
  const path = window.location.pathname;
  const title = pageTitles[path] ?? "워크아웃";

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white shadow-sm"
      data-theme={theme}
    >
      <h1 className="text-lg font-extrabold text-[var(--color-primary)]">💪 {title}</h1>
      <span className="text-sm text-gray-400">0 P</span>
    </header>
  );
}
