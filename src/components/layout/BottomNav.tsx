import { Link, useLocation } from "react-router-dom";
import {
  HiHome,
  HiUserGroup,
  HiCurrencyDollar,
  HiCog,
  HiUser,
} from "react-icons/hi";
import { HiChatBubbleLeftRight } from "react-icons/hi2";

const navItems = [
  { to: "/",          icon: HiHome,                label: "홈" },
  { to: "/community", icon: HiChatBubbleLeftRight,  label: "커뮤니티" },
  { to: "/party",     icon: HiUserGroup,            label: "파티" },
  { to: "/points",    icon: HiCurrencyDollar,       label: "포인트" },
  { to: "/mypage",    icon: HiUser,                 label: "마이페이지" },
  { to: "/settings",  icon: HiCog,                  label: "설정" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  if (pathname === "/workout") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 flex max-w-md mx-auto">
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
            <span className="text-[9px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
