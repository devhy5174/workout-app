import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiHome, HiUserGroup, HiCog, HiUser } from "react-icons/hi";
import { HiChatBubbleLeftRight, HiTrophy } from "react-icons/hi2";
import { useUser } from "../../context/UserContext";
import { hasActivePartyMember, getUserPartyId } from "../../lib/partyService";

const navItems = [
  { to: "/", icon: HiHome, label: "홈" },
  { to: "/community", icon: HiChatBubbleLeftRight, label: "인증" },
  { to: "/party", icon: HiUserGroup, label: "파티" },
  { to: "/mypage", icon: HiUser, label: "마이페이지" },
  { to: "/steps", icon: HiTrophy, label: "걸음" },
  { to: "/settings", icon: HiCog, label: "설정" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [partyActive, setPartyActive] = useState(false);
  const [myPartyId, setMyPartyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    hasActivePartyMember(user.id).then(setPartyActive);
    getUserPartyId(user.id).then(setMyPartyId);
  }, [user?.id]);

  useEffect(() => {
    if (pathname === "/party") {
      setPartyActive(false);
    }
  }, [pathname]);

  if (pathname === "/workout") return null;

  const isPartyDetailActive =
    pathname.startsWith("/party/") && myPartyId
      ? pathname === `/party/${myPartyId}`
      : false;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 flex max-w-md mx-auto">
      {navItems.map(({ to, icon: Icon, label }) => {
        const isParty = to === "/party";
        const active = isParty
          ? pathname === "/party" || isPartyDetailActive
          : pathname === to;

        if (isParty && myPartyId) {
          return (
            <button
              key={to}
              onClick={() => navigate(`/party/${myPartyId}`)}
              aria-label="내 파티"
              className={`relative flex-1 flex flex-col items-center py-2 gap-0.5 transition ${
                active ? "text-[var(--color-primary)]" : "text-gray-400"
              }`}
            >
              {partyActive && (
                <span className="absolute -top-7 left-45 -translate-x-1/2 animate-bounce pointer-events-none z-20">
                  <span className="relative flex items-center whitespace-nowrap bg-primary text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                    파티원 운동중!
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-primary" />
                  </span>
                </span>
              )}
              <Icon className="text-xl" />
              <span className="text-[9px] font-semibold">{label}</span>
            </button>
          );
        }

        return (
          <Link
            key={to}
            to={to}
            className={`relative flex-1 flex flex-col items-center py-2 gap-0.5 transition ${
              active ? "text-[var(--color-primary)]" : "text-gray-400"
            }`}
          >
            {isParty && partyActive && (
              <span className="absolute -top-7 left-45 -translate-x-1/2 animate-bounce pointer-events-none z-20">
                <span className="relative flex items-center whitespace-nowrap bg-primary text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                  파티원 운동중!
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-primary" />
                </span>
              </span>
            )}
            <Icon className="text-xl" />
            <span className="text-[9px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
