export default function Community() {
  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-y-auto pb-20">
      <div className="mb-1">
        <h2 className="text-2xl font-extrabold text-[var(--color-primary)]">커뮤니티</h2>
        <p className="text-sm text-gray-400 mt-1">다른 유저들과 운동 이야기를 나눠봐!</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 flex flex-col items-center justify-center gap-3">
        <span className="text-5xl">🏗️</span>
        <p className="font-extrabold text-gray-700 text-base">준비 중이에요</p>
        <p className="text-sm text-gray-400 text-center">
          커뮤니티 기능은 곧 오픈될 예정이에요.
          <br />
          조금만 기다려주세요!
        </p>
      </div>
    </div>
  );
}
