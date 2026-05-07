import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/": "홈",
  "/character": "캐릭터",
  "/party": "파티",
  "/goal": "목표",
  "/diet": "식단",
  "/points": "포인트",
  "/settings": "설정",
};

export default function Header() {
  const { pathname } = useLocation();
  if (pathname === "/workout") return null;
  const title = pageTitles[pathname] ?? "워크아웃";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white shadow-sm">
      <h1 className="text-lg font-extrabold text-primary">💪 {title}</h1>
      <span className="text-sm text-gray-400">0 P</span>
    </header>
  );
}
