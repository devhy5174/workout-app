const streak = 7;
const steps = 6234;
const stepGoal = 10000;
const workoutDays = 3;
const workoutGoal = 5;
const points = 234;
const pointGoal = 500;

const messages = [
  "오늘도 같이 달려보자구! 🔥",
  "넌 할 수 있어, 믿어! 💪",
  "조금만 더! 거의 다 왔어 ✨",
];
const bubbleMsg = messages[streak % messages.length];

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-bg">

      {/* 상단 Streak */}
      <div className="flex justify-between items-center px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-primary-light rounded-full px-4 py-1.5">
          <span className="text-lg">🔥</span>
          <span className="font-extrabold text-primary text-sm">{streak}일 연속 운동 중!</span>
        </div>
        <div className="bg-white rounded-full px-4 py-1.5 shadow-sm">
          <span className="text-sm font-bold text-primary">{points} P</span>
        </div>
      </div>

      {/* 캐릭터 + 말풍선 */}
      <div className="flex flex-col items-center px-6 pt-4 pb-2">

        {/* 말풍선 */}
        <div className="relative bg-white rounded-2xl px-5 py-3 shadow-md mb-2">
          <p className="text-sm font-bold text-gray-700 text-center">{bubbleMsg}</p>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0
            border-l-[10px] border-l-transparent
            border-r-[10px] border-r-transparent
            border-t-[12px] border-t-white" />
        </div>

        {/* 캐릭터 이미지 */}
        <div className="relative mt-4">
          <div className="w-44 h-44 rounded-full bg-gradient-to-br from-primary to-secondary shadow-xl flex items-center justify-center">
            <span className="text-8xl select-none">🏃</span>
          </div>
          <span className="absolute top-1 right-3 text-xl animate-bounce">✨</span>
          <span className="absolute bottom-4 left-0 text-lg animate-bounce delay-150">⚡</span>
        </div>
      </div>

      {/* 스탯 카드 */}
      <div className="mx-4 mt-6 flex flex-col gap-4">

        {/* 걸음 수 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">👟</span>
              <span className="font-bold text-gray-700">걸음 수</span>
            </div>
            <span className="font-extrabold text-primary">
              {steps.toLocaleString()}
              <span className="text-gray-300 font-normal text-sm"> / {stepGoal.toLocaleString()}</span>
            </span>
          </div>
          <ProgressBar value={steps} max={stepGoal} color="bg-gradient-to-r from-primary to-secondary" />
        </div>

        {/* 이번주 운동 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏋️</span>
              <span className="font-bold text-gray-700">이번주 운동</span>
            </div>
            <span className="font-extrabold text-primary">
              {workoutDays}일
              <span className="text-gray-300 font-normal text-sm"> / {workoutGoal}일</span>
            </span>
          </div>
          <ProgressBar value={workoutDays} max={workoutGoal} color="bg-gradient-to-r from-secondary to-primary" />
          {/* 요일 동그라미 */}
          <div className="flex justify-between pt-1">
            {["월", "화", "수", "목", "금"].map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < workoutDays
                      ? "bg-primary text-white shadow-sm"
                      : "border-2 border-gray-100 text-gray-300"
                  }`}
                >
                  {day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 포인트 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <span className="font-bold text-gray-700">포인트 저금</span>
            </div>
            <span className="font-extrabold text-primary">
              {points} P
              <span className="text-gray-300 font-normal text-sm"> / {pointGoal} P</span>
            </span>
          </div>
          <ProgressBar value={points} max={pointGoal} color="bg-gradient-to-r from-accent to-primary" />
        </div>

      </div>

      {/* 오늘의 한마디 */}
      <div className="mx-4 mt-4 mb-6 rounded-2xl bg-gradient-to-r from-primary to-secondary p-4 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="text-white font-extrabold text-sm">오늘 목표까지 {(stepGoal - steps).toLocaleString()} 걸음!</p>
          <p className="text-white/70 text-xs mt-0.5">지금 바로 나가서 걸어보자 💨</p>
        </div>
      </div>

    </div>
  );
}
