export default function Goal() {
  const targetKm = 100;
  const currentKm = 0;
  const percent = Math.min((currentKm / targetKm) * 100, 100);
  const pointsEarned = currentKm * 10;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="text-2xl font-bold text-[var(--color-primary)]">목표 & 저금</h2>

      <div className="w-full rounded-2xl bg-white shadow p-6 flex flex-col gap-3">
        <div className="flex justify-between text-sm text-gray-500">
          <span>목표 거리</span>
          <span className="font-semibold text-gray-800">{currentKm} / {targetKm} km</span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">{percent.toFixed(1)}% 달성</p>
      </div>

      <div className="w-full rounded-2xl bg-white shadow p-6 flex flex-col gap-2">
        <p className="text-sm text-gray-500">누적 포인트 (저금)</p>
        <p className="text-4xl font-extrabold text-[var(--color-secondary)]">{pointsEarned} P</p>
        <p className="text-xs text-gray-400">1km 달성 시 10P 적립</p>
      </div>
    </div>
  );
}
