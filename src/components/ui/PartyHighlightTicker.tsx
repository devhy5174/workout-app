import { useState, useEffect } from "react";

export type TickerItem = { text: string; partyId: string; content?: React.ReactNode };

export function PartyHighlightTicker({
  icon,
  iconBg,
  label,
  items,
  emptyText,
  onTap,
  cardBg = "bg-white",
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  items: TickerItem[];
  emptyText: string;
  onTap: (partyId: string) => void;
  cardBg?: string;
}) {
  const [currIndex, setCurrIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  // items 줄면 인덱스 초기화
  useEffect(() => {
    if (items.length > 0 && currIndex >= items.length) {
      setCurrIndex(0);
      setAnimKey(0);
    }
  }, [items.length, currIndex]);

  useEffect(() => {
    if (items.length <= 1) return;
    const len = items.length;
    const t = setInterval(() => {
      setAnimKey((k) => k + 1);
      setCurrIndex((prev) => (prev + 1) % len);
    }, 3000);
    return () => clearInterval(t);
  }, [items.length]);

  const hasItems = items.length > 0;
  const safeIdx = hasItems ? currIndex % items.length : 0;
  const prevIdx = hasItems ? ((safeIdx - 1 + items.length) % items.length) : 0;
  const current = hasItems ? items[safeIdx] : null;
  const prev = hasItems && animKey > 0 ? items[prevIdx] : null;

  const renderContent = (item: TickerItem) =>
    item.content ? (
      <span className="text-xs font-semibold truncate flex items-center min-w-0">{item.content}</span>
    ) : (
      <span className="text-xs font-semibold text-gray-600 truncate">{item.text}</span>
    );

  return (
    <div className={`${cardBg} rounded-2xl shadow-sm px-4 h-12 flex items-center gap-3 overflow-hidden`}>
      <style>{`
        @keyframes tickerExitUp {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(-120%); opacity: 0; }
        }
        @keyframes tickerEnterBelow {
          from { transform: translateY(120%);  opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>

      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>

      <div className="flex flex-col justify-center flex-1 overflow-hidden min-w-0">
        <span className="text-[10px] font-bold text-gray-400 leading-none mb-0.5">{label}</span>
        <div className="relative h-4 overflow-hidden">
          {!hasItems ? (
            <div className="absolute inset-0 flex items-center">
              <p className="text-xs text-gray-300">{emptyText}</p>
            </div>
          ) : (
            <>
              {prev && (
                <button
                  key={`exit-${animKey}`}
                  onClick={() => onTap(prev.partyId)}
                  className="absolute inset-0 flex items-center w-full text-left min-w-0"
                  style={{ animation: "tickerExitUp 0.35s ease-in-out forwards" }}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  {renderContent(prev)}
                </button>
              )}
              {current && (
                <button
                  key={`enter-${animKey}`}
                  onClick={() => onTap(current.partyId)}
                  className="absolute inset-0 flex items-center w-full text-left min-w-0"
                  style={animKey > 0 ? { animation: "tickerEnterBelow 0.35s ease-in-out forwards" } : undefined}
                >
                  {renderContent(current)}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
