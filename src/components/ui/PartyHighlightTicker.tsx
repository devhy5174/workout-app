import { useState, useEffect, useRef } from "react";

export type TickerItem = { text: string; partyId: string };

export function PartyHighlightTicker({
  icon,
  badge,
  badgeStyle,
  items,
  emptyText,
  onTap,
}: {
  icon: string;
  badge: string;
  badgeStyle: React.CSSProperties;
  items: TickerItem[];
  emptyText: string;
  onTap: (partyId: string) => void;
}) {
  const [currIndex, setCurrIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const currIndexRef = useRef(0);
  const lenRef = useRef(items.length);

  useEffect(() => { currIndexRef.current = currIndex; }, [currIndex]);

  useEffect(() => {
    lenRef.current = items.length;
    if (items.length > 0 && currIndex >= items.length) {
      setCurrIndex(0);
      currIndexRef.current = 0;
    }
  }, [items.length, currIndex]);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setTransitioning(true), 3000);
    return () => clearInterval(t);
  }, [items.length]);

  const handleEnterEnd = () => {
    const len = lenRef.current;
    if (len === 0) return;
    const next = (currIndexRef.current + 1) % len;
    setCurrIndex(next);
    currIndexRef.current = next;
    setTransitioning(false);
  };

  const hasItems = items.length > 0;
  const safeIdx = hasItems ? currIndex % items.length : 0;
  const nextIdx = hasItems ? (safeIdx + 1) % items.length : 0;
  const current = hasItems ? items[safeIdx] : null;
  const next = hasItems && items.length > 1 ? items[nextIdx] : null;

  const renderText = (item: TickerItem, idx: number | string, anim?: React.CSSProperties) => (
    <button
      key={idx}
      onClick={() => onTap(item.partyId)}
      className="absolute inset-0 flex items-center gap-1.5 w-full text-left"
      style={anim}
    >
      <span className="text-[11px] text-gray-500 truncate">{item.text}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 h-9 flex items-center gap-2.5 overflow-hidden">
      <style>{`
        @keyframes tickerExitUp {
          from { transform: translateY(0);     opacity: 1; }
          to   { transform: translateY(-110%); opacity: 0; }
        }
        @keyframes tickerEnterBelow {
          from { transform: translateY(110%);  opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
      <span className="text-gray-300 text-xs shrink-0">{icon}</span>
      <span
        className="font-extrabold shrink-0 px-1.5 py-0.5 rounded-full text-[9px] whitespace-nowrap"
        style={badgeStyle}
      >
        {badge}
      </span>
      <div className="flex-1 relative h-5 overflow-hidden">
        {!hasItems ? (
          <div className="absolute inset-0 flex items-center">
            <p className="text-[11px] text-gray-300">{emptyText}</p>
          </div>
        ) : (
          <>
            {current && renderText(
              current,
              safeIdx,
              transitioning ? { animation: "tickerExitUp 0.38s ease-in-out forwards" } : undefined,
            )}
            {transitioning && next && (
              <button
                key="entering"
                onClick={() => onTap(next.partyId)}
                className="absolute inset-0 flex items-center w-full text-left"
                style={{ animation: "tickerEnterBelow 0.38s ease-in-out forwards" }}
                onAnimationEnd={handleEnterEnd}
              >
                <span className="text-[11px] text-gray-500 truncate">{next.text}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
