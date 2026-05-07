const characters = [
  { id: 1, name: "전사", emoji: "⚔️", desc: "힘과 체력 특화" },
  { id: 2, name: "마법사", emoji: "🧙", desc: "민첩과 지속력 특화" },
  { id: 3, name: "궁수", emoji: "🏹", desc: "속도와 균형 특화" },
];

export default function Character() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl font-bold text-[var(--color-primary)]">캐릭터 선택</h2>
      {characters.map((c) => (
        <button
          key={c.id}
          className="w-full rounded-2xl bg-white shadow p-5 flex items-center gap-4 text-left hover:ring-2 hover:ring-[var(--color-primary)] transition"
        >
          <span className="text-4xl">{c.emoji}</span>
          <div>
            <p className="font-bold text-gray-800">{c.name}</p>
            <p className="text-sm text-gray-500">{c.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
