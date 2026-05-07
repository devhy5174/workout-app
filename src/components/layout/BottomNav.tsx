import { Link, useLocation } from "react-router-dom";
import { HiHome, HiUser, HiUserGroup, HiClipboardList, HiCurrencyDollar, HiCog } from "react-icons/hi";

const navItems = [
  { to: "/", icon: HiHome, label: "홈" },
  { to: "/character", icon: HiUser, label: "캐릭터" },
  { to: "/party", icon: HiUserGroup, label: "파티" },
  { to: "/diet", icon: HiClipboardList, label: "식단" },
  { to: "/points", icon: HiCurrencyDollar, label: "포인트" },
  { to: "/settings", icon: HiCog, label: "설정" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 flex">
      {navItems.map(({ to, icon: Icon, label }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition ${
              active ? "text-[var(--color-primary)]" : "text-gray-400"
            }`}
          >
            <Icon className="text-xl" />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
