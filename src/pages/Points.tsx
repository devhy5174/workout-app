import { useState } from "react";

const myPoints = 1234;

const history = [
  { id: 1, date: "2026.05.07", desc: "걸음 수 목표 달성", points: +50, icon: "👟" },
  { id: 2, date: "2026.05.07", desc: "7일 연속 운동 보너스", points: +200, icon: "🔥" },
  { id: 3, date: "2026.05.06", desc: "걸음 수 목표 달성", points: +50, icon: "👟" },
  { id: 4, date: "2026.05.06", desc: "파티 참여 완료", points: +30, icon: "🎉" },
  { id: 5, date: "2026.05.05", desc: "걸음 수 목표 달성", points: +50, icon: "👟" },
  { id: 6, date: "2026.05.04", desc: "주간 목표 달성", points: +150, icon: "🏆" },
  { id: 7, date: "2026.05.04", desc: "걸음 수 목표 달성", points: +50, icon: "👟" },
  { id: 8, date: "2026.05.03", desc: "친구에게 선물", points: -100, icon: "🎁" },
  { id: 9, date: "2026.05.02", desc: "걸음 수 목표 달성", points: +50, icon: "👟" },
  { id: 10, date: "2026.05.01", desc: "첫 운동 보너스", points: +100, icon: "✨" },
];

const friends = [
  { id: 1, name: "김철수", emoji: "🧑", level: "스프린터 Lv.4" },
  { id: 2, name: "이영희", emoji: "👩", level: "요가마스터 Lv.2" },
  { id: 3, name: "박민준", emoji: "🧒", level: "워커 Lv.6" },
  { id: 4, name: "최수아", emoji: "👧", level: "어드벤처러 Lv.3" },
  { id: 5, name: "정도현", emoji: "👦", level: "파워리프터 Lv.1" },
];

const giftItems = [
  { id: 1, name: "스타벅스 아메리카노", brand: "스타벅스", points: 4500, emoji: "☕" },
  { id: 2, name: "메가커피 음료", brand: "메가MGC커피", points: 2000, emoji: "🧋" },
  { id: 3, name: "GS25 상품권 3,000원", brand: "GS25", points: 3000, emoji: "🏪" },
  { id: 4, name: "CU 상품권 5,000원", brand: "CU", points: 5000, emoji: "🛒" },
  { id: 5, name: "배달의민족 쿠폰", brand: "배달의민족", points: 3000, emoji: "🍜" },
  { id: 6, name: "올리브영 쿠폰", brand: "올리브영", points: 5000, emoji: "💄" },
];

type Tab = "history" | "gift" | "exchange";

export default function Points() {
  const [tab, setTab] = useState<Tab>("history");
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  const [giftAmount, setGiftAmount] = useState("");

  const tabs: { key: Tab; label: string }[] = [
    { key: "history", label: "적립내역" },
    { key: "gift", label: "선물하기" },
    { key: "exchange", label: "교환하기" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-bg">

      {/* 잔액 카드 */}
      <div className="mx-4 mt-5 rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 shadow-lg">
        <p className="text-white/70 text-sm font-semibold">내 포인트 잔액</p>
        <p className="text-white text-5xl font-extrabold mt-1 tracking-tight">
          {myPoints.toLocaleString()}
          <span className="text-2xl ml-1 font-bold opacity-80">P</span>
        </p>
        <p className="text-white/70 text-xs mt-3">1km 달성 시 10P · 목표 달성 시 보너스 지급</p>
      </div>

      {/* 탭 */}
      <div className="mx-4 mt-5 flex bg-white rounded-2xl shadow-sm p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === key
                ? "bg-primary text-white shadow-sm"
                : "text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 pb-8 flex flex-col gap-3">

        {/* ── 적립내역 ── */}
        {tab === "history" && (
          <>
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.desc}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                </div>
                <span className={`font-extrabold text-base flex-shrink-0 ${item.points > 0 ? "text-primary" : "text-gray-400"}`}>
                  {item.points > 0 ? `+${item.points}` : item.points} P
                </span>
              </div>
            ))}
          </>
        )}

        {/* ── 선물하기 ── */}
        {tab === "gift" && (
          <>
            <p className="text-xs text-gray-400 px-1">친구를 선택하고 포인트를 선물하세요 🎁</p>

            {friends.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFriend(f.id === selectedFriend ? null : f.id)}
                className={`bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 text-left transition-all border-2 ${
                  selectedFriend === f.id ? "border-primary scale-[1.01]" : "border-transparent"
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {f.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{f.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.level}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedFriend === f.id ? "bg-primary border-transparent" : "border-gray-200"
                }`}>
                  {selectedFriend === f.id && <span className="text-white text-xs font-bold">✓</span>}
                </div>
              </button>
            ))}

            {selectedFriend !== null && (
              <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex flex-col gap-3 mt-1">
                <p className="text-sm font-bold text-gray-700">선물할 포인트 입력</p>
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
            <div className="bg-primary-light rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-lg">🚧</span>
              <p className="text-sm text-primary font-semibold">교환 기능은 곧 오픈 예정이에요!</p>
            </div>

            {giftItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 opacity-70">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
                  <p className="text-sm font-extrabold text-primary mt-1">{item.points.toLocaleString()} P</p>
                </div>
                <span className="flex-shrink-0 bg-gray-100 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-full">
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
