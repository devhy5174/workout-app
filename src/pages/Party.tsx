const parties = [
  { id: 1, name: "새벽 러닝 크루", members: 12, distance: "5km", emoji: "🌅" },
  { id: 2, name: "주말 등산 모임", members: 8, distance: "10km", emoji: "⛰️" },
  { id: 3, name: "저녁 산책 파티", members: 5, distance: "3km", emoji: "🌙" },
];

export default function Party() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl font-bold text-[var(--color-primary)]">동네 파티</h2>
      {parties.map((p) => (
        <div key={p.id} className="w-full rounded-2xl bg-white shadow p-5 flex items-center gap-4">
          <span className="text-4xl">{p.emoji}</span>
          <div className="flex-1">
            <p className="font-bold text-gray-800">{p.name}</p>
            <p className="text-sm text-gray-500">멤버 {p.members}명 · {p.distance}</p>
          </div>
          <button className="text-sm font-semibold text-[var(--color-primary)] border border-[var(--color-primary)] rounded-full px-3 py-1 hover:bg-[var(--color-primary)] hover:text-white transition">
            참가
          </button>
        </div>
      ))}
    </div>
  );
}
