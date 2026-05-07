const todayKcal = 870;
const kcalGoal = 2000;
const todaySteps = 6234;
const characterType = "워커";

const meals = [
  { time: "아침", emoji: "🌄", items: ["오트밀", "바나나", "우유"], kcal: 350 },
  { time: "점심", emoji: "☀️", items: ["닭가슴살", "현미밥", "샐러드"], kcal: 520 },
  { time: "저녁", emoji: "🌙", items: [], kcal: 0 },
];

const dinnerRecommend = [
  { name: "삶은계란", emoji: "🥚", kcal: 78 },
  { name: "고구마", emoji: "🍠", kcal: 130 },
  { name: "그릭요거트", emoji: "🥛", kcal: 100 },
];

const stepRecommend = {
  title: `오늘 ${todaySteps.toLocaleString()}보 걸었어요!`,
  tag: "단백질 보충 추천",
  items: ["닭가슴살 샐러드", "두부 된장국", "삶은계란 2개"],
  emoji: "🏃",
};

const characterRecommend: Record<string, { desc: string; items: string[]; emoji: string }> = {
  워커: {
    desc: "꾸준한 산책엔 가벼운 식단이 딱!",
    items: ["현미밥 + 나물반찬", "두유 한 잔", "과일 한 조각"],
    emoji: "🚶",
  },
  스프린터: {
    desc: "고강도 운동 후엔 탄수화물 충전!",
    items: ["바나나 + 프로틴쉐이크", "현미밥 + 닭가슴살", "초코우유"],
    emoji: "🏃",
  },
  요가마스터: {
    desc: "몸의 균형을 위한 식단을 추천해요",
    items: ["그릭요거트 + 견과류", "아보카도 토스트", "그린스무디"],
    emoji: "🧘",
  },
};

const myCharRec = characterRecommend[characterType] ?? characterRecommend["워커"];

export default function Diet() {
  const kcalPct = Math.min((todayKcal / kcalGoal) * 100, 100);

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-20 h-full overflow-y-auto bg-bg">
      <h2 className="text-2xl font-extrabold text-primary px-1">오늘의 식단</h2>

      {/* 칼로리 진행 카드 */}
      <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-gray-700">오늘 칼로리</span>
          </div>
          <span className="font-extrabold text-primary">
            {todayKcal.toLocaleString()}
            <span className="text-gray-300 font-normal text-sm"> / {kcalGoal.toLocaleString()} kcal</span>
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
            style={{ width: `${kcalPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">{kcalPct.toFixed(0)}% 달성 · 남은 칼로리 {(kcalGoal - todayKcal).toLocaleString()} kcal</p>
      </div>

      {/* 식사 카드 */}
      {meals.map((m) => {
        const isEmpty = m.items.length === 0;
        return (
          <div key={m.time} className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{m.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{m.time}</p>
                {isEmpty ? (
                  <p className="text-sm text-gray-400">아직 기록 없음</p>
                ) : (
                  <p className="text-sm text-gray-500">{m.items.join(", ")}</p>
                )}
              </div>
              <p className="text-sm font-extrabold text-primary flex-shrink-0">
                {isEmpty ? "- kcal" : `${m.kcal} kcal`}
              </p>
            </div>

            {/* 저녁 미정 → 추천 */}
            {isEmpty && m.time === "저녁" && (
              <div className="border-t border-gray-50 pt-3 flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-400">🍽️ 저녁 추천 메뉴</p>
                <div className="flex gap-2">
                  {dinnerRecommend.map((r) => (
                    <div key={r.name} className="flex-1 bg-primary-light rounded-2xl p-3 flex flex-col items-center gap-1">
                      <span className="text-2xl">{r.emoji}</span>
                      <p className="text-xs font-bold text-gray-700 text-center">{r.name}</p>
                      <p className="text-[10px] text-gray-400">{r.kcal} kcal</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 운동 후 알림 배너 */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-4 flex items-center gap-3">
        <span className="text-2xl">💪</span>
        <p className="text-white font-bold text-sm">운동 후 30분 이내 단백질을 섭취하세요!</p>
      </div>

      {/* 운동량 기반 추천 */}
      <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{stepRecommend.emoji}</span>
          <div>
            <p className="font-bold text-gray-800 text-sm">{stepRecommend.title}</p>
            <span className="text-xs font-bold text-primary bg-primary-light rounded-full px-2 py-0.5">
              {stepRecommend.tag}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {stepRecommend.items.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <p className="text-sm text-gray-600">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 캐릭터 유형 추천 */}
      <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{myCharRec.emoji}</span>
          <div>
            <p className="text-xs text-gray-400 font-semibold">{characterType} 맞춤 추천</p>
            <p className="font-bold text-gray-800 text-sm">{myCharRec.desc}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {myCharRec.items.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
              <p className="text-sm text-gray-600">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
