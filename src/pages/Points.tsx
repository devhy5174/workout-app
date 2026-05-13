import { useState } from "react";
import { POINT_RULES, POINT_EXCHANGE } from "../data/points";
import { useUser } from "../context/UserContext";
import { usePoints } from "../hooks/usePoints";


const friends = [
  { id: 1, name: "김철수", emoji: "🧑", level: "스프린터 Lv.4" },
  { id: 2, name: "이영희", emoji: "👩", level: "요가마스터 Lv.2" },
  { id: 3, name: "박민준", emoji: "🧒", level: "워커 Lv.6" },
  { id: 4, name: "최수아", emoji: "👧", level: "어드벤처러 Lv.3" },
  { id: 5, name: "정도현", emoji: "👦", level: "파워리프터 Lv.1" },
];

const exchangeMeta: Record<string, { brand: string; emoji: string }> = {
  "스타벅스 아메리카노": { brand: "스타벅스", emoji: "☕" },
  "이디야 카페라떼": { brand: "이디야커피", emoji: "🥛" },
  "편의점 상품권": { brand: "편의점", emoji: "🏪" },
};

const brandItems = [
  {
    id: 1,
    name: "뉴발란스 10% 할인쿠폰",
    brand: "New Balance",
    points: 5000,
    emoji: "👟",
  },
  {
    id: 2,
    name: "헬스장 1일 이용권",
    brand: "제휴 헬스장",
    points: 8000,
    emoji: "🏋️",
  },
];

type Tab = "history" | "gift" | "exchange";

function formatPointDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

export default function Points() {
  const [tab, setTab] = useState<Tab>("history");
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  const [giftAmount, setGiftAmount] = useState("");

  const { user, userProfile } = useUser();
  const { history: pointHistory, isLoading: historyLoading } = usePoints(user?.id ?? null);
  const myPoints = userProfile?.points ?? 0;
  const history = pointHistory.map((entry) => ({
    icon: entry.icon,
    desc: entry.description,
    points: entry.points,
    date: entry.created_at ? formatPointDate(entry.created_at) : "",
  }));

  const tabs: { key: Tab; label: string }[] = [
    { key: "history", label: "적립내역" },
    { key: "gift", label: "선물하기" },
    { key: "exchange", label: "교환하기" },
  ];

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* 잔액 카드 */}
      <div className="mx-4 mt-5 rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 shadow-lg">
        <p className="text-white/70 text-sm font-semibold">내 포인트 잔액</p>
        <p className="text-white text-5xl font-extrabold mt-1 tracking-tight">
          {myPoints.toLocaleString()}
          <span className="text-2xl ml-1 font-bold opacity-80">P</span>
        </p>
        <p className="text-white/70 text-xs mt-3">
          1km 달성 시 {POINT_RULES.PER_KM}P · 목표 달성 시 보너스 지급
        </p>
      </div>

      {/* 탭 */}
      <div className="mx-4 mt-5 flex bg-white rounded-2xl shadow-sm p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === key ? "bg-primary text-white shadow-sm" : "text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-20 flex flex-col gap-3">
        {/* ── 적립내역 ── */}
        {tab === "history" && (
          <>
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
                <span className="text-4xl animate-pulse">💰</span>
                <p className="text-sm font-bold">불러오는 중...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
                <span className="text-5xl">🏃</span>
                <p className="font-bold text-sm">아직 적립 내역이 없어요</p>
                <p className="text-xs">운동을 완료하면 포인트가 쌓여요!</p>
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">
                      {item.desc}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                  </div>
                  <span
                    className={`font-extrabold text-base flex-shrink-0 ${item.points > 0 ? "text-primary" : "text-gray-400"}`}
                  >
                    {item.points > 0 ? `+${item.points}` : item.points} P
                  </span>
                </div>
              ))
            )}
          </>
        )}

        {/* ── 선물하기 ── */}
        {tab === "gift" && (
          <>
            <p className="text-xs text-gray-400 px-1">
              친구를 선택하고 포인트를 선물하세요 🎁
            </p>

            {friends.map((f) => (
              <button
                key={f.id}
                onClick={() =>
                  setSelectedFriend(f.id === selectedFriend ? null : f.id)
                }
                className={`bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 text-left transition-all border-2 ${
                  selectedFriend === f.id
                    ? "border-primary scale-[1.01]"
                    : "border-transparent"
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {f.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{f.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.level}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedFriend === f.id
                      ? "bg-primary border-transparent"
                      : "border-gray-200"
                  }`}
                >
                  {selectedFriend === f.id && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </div>
              </button>
            ))}

            {selectedFriend !== null && (
              <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex flex-col gap-3 mt-1">
                <p className="text-sm font-bold text-gray-700">
                  선물할 포인트 입력
                </p>
                <div className="flex gap-2">
                  {[50, 100, 200, 500].map((v) => (
                    <button
                      key={v}
                      onClick={() => setGiftAmount(String(v))}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition ${
                        giftAmount === String(v)
                          ? "bg-primary-light border-primary text-primary"
                          : "border-gray-100 text-gray-500"
                      }`}
                    >
                      {v}P
                    </button>
                  ))}
                </div>
                <button
                  disabled={!giftAmount}
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all ${
                    giftAmount
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-sm active:scale-95"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {giftAmount
                    ? `${friends.find((f) => f.id === selectedFriend)?.name}에게 ${giftAmount}P 선물하기 🎁`
                    : "포인트를 선택해주세요"}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── 교환하기 ── */}
        {tab === "exchange" && (
          <>
            {/* 공지 */}
            <div className="bg-primary-light rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-lg">🚧</span>
              <p className="text-sm text-primary font-semibold">
                교환 기능은 준비중이에요!
              </p>
            </div>

            {/* 카페 & 편의점 섹션 */}
            <p className="text-xs font-bold text-gray-400 px-1 mt-1">☕ 카페 & 편의점</p>
            {POINT_EXCHANGE.map((item) => {
              const meta = exchangeMeta[item.name] ?? { brand: "", emoji: "🎁" };
              return (
                <div
                  key={item.name}
                  className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 opacity-60"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{meta.brand}</p>
                    <p className="text-sm font-extrabold text-primary mt-1">
                      {item.points.toLocaleString()} P
                    </p>
                  </div>
                  <span className="flex-shrink-0 bg-gray-100 text-gray-400 text-xs font-bold px-3 py-2 rounded-full">
                    준비중
                  </span>
                </div>
              );
            })}

            {/* 제휴브랜드 섹션 */}
            <p className="text-xs font-bold text-gray-400 px-1 mt-3">
              🤝 제휴브랜드
            </p>
            {brandItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 opacity-60"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
                  <p className="text-sm font-extrabold text-primary mt-1">
                    {item.points.toLocaleString()} P
                  </p>
                </div>
                <span className="flex-shrink-0 bg-gray-100 text-gray-400 text-xs font-bold px-3 py-2 rounded-full">
                  준비중
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
