const meals = [
  { time: "아침", emoji: "🌄", items: ["오트밀", "바나나", "우유"], kcal: 350 },
  { time: "점심", emoji: "☀️", items: ["닭가슴살", "현미밥", "샐러드"], kcal: 520 },
  { time: "저녁", emoji: "🌙", items: ["미정"], kcal: 0 },
];

export default function Diet() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl font-bold text-[var(--color-primary)]">오늘의 식단</h2>
      {meals.map((m) => (
        <div key={m.time} className="w-full rounded-2xl bg-white shadow p-5 flex items-start gap-4">
          <span className="text-3xl mt-1">{m.emoji}</span>
          <div className="flex-1">
            <p className="font-bold text-gray-800">{m.time}</p>
            <p className="text-sm text-gray-500">{m.items.join(", ")}</p>
          </div>
          <p className="text-sm font-semibold text-[var(--color-primary)]">{m.kcal} kcal</p>
        </div>
      ))}

      <div className="rounded-2xl bg-[var(--color-primary)] p-4 text-white text-center">
        <p className="font-bold">운동 후 30분 이내 단백질을 섭취하세요! 💪</p>
      </div>
    </div>
  );
}
