import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useActivityType } from "../context/ActivityTypeContext";
import { useCharacter } from "../context/CharacterContext";
import { useUser } from "../context/UserContext";
import { storage } from "../utils/storage";
import { calculateStreak, getThisWeekWorkouts } from "../utils/streak";
import { getRandomMessage } from "../data/characterMessages";

const workoutGoal = 7;
const pointGoal = 500;

function useTypingEffect(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return displayed;
}

const weeklyTop3 = [
  {
    rank: 1,
    name: "번개맨",
    steps: 18430,
    medal: "🥇",
    bgColor: "#fefce8",
    textColor: "#ca8a04",
  },
  {
    rank: 2,
    name: "달리기왕",
    steps: 15220,
    medal: "🥈",
    bgColor: "#f9fafb",
    textColor: "#6b7280",
  },
  {
    rank: 3,
    name: "산책러",
    steps: 12870,
    medal: "🥉",
    bgColor: "#fff7ed",
    textColor: "#fb923c",
  },
];

const GOAL_TYPE_UNIT = {
  steps: "보",
  distance: "km",
  calories: "kcal",
};

function ProgressBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
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
  const { selectedActivityType } = useActivityType();
  const { selectedCharacter } = useCharacter();
  const { userGoal, workoutRecords, userProfile } = useUser();

  const characterName = selectedActivityType?.name ?? null;

  const history = storage.getWorkoutHistory();
  const streak = calculateStreak(history);
  const points = userProfile?.points ?? 0;
  const weekWorkouts = getThisWeekWorkouts(history);
  const workoutDays = weekWorkouts.filter(Boolean).length;
  const burnedKcal = storage.getBurnedKcal();

  // 페이지 로드마다 캐릭터에 맞는 랜덤 메시지
  const activityType = selectedActivityType?.type ?? "walker";
  const [bubbleMsg, setBubbleMsg] = useState(() => getRandomMessage(activityType));
  const displayedText = useTypingEffect(bubbleMsg);

  const handleCharacterTap = () => {
    setBubbleMsg(getRandomMessage(activityType));
  };

  // 오늘 목표 진행률
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = workoutRecords.filter((r) => r.date === today);
  const todaySteps = todayRecords.reduce((s, r) => s + r.steps, 0);
  const todayCalories = todayRecords.reduce((s, r) => s + r.calories, 0);
  const todayDistance = todayRecords.reduce((s, r) => s + r.distance, 0);

  const todayGoalValue =
    userGoal?.goal_type === "steps"
      ? todaySteps
      : userGoal?.goal_type === "distance"
        ? todayDistance
        : todayCalories;

  const goalPct = userGoal
    ? Math.min(Math.round((todayGoalValue / userGoal.goal_value) * 100), 100)
    : 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20 bg-bg">
      {/* 상단 Streak */}
      <div className="flex justify-between items-center px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-primary-light rounded-full px-4 py-1.5">
          <span className="text-lg">🔥</span>
          <span className="font-extrabold text-primary text-sm">
            {streak}일 연속 운동 중!
          </span>
        </div>
        <div className="bg-white rounded-full px-4 py-1.5 shadow-sm">
          <span className="text-sm font-bold text-primary">{points} P</span>
        </div>
      </div>

      {/* 캐릭터 + 말풍선 */}
      <div className="flex flex-col items-center px-6 pt-4 pb-2">
        <div className="relative bg-white rounded-2xl px-5 py-3 shadow-md mb-2 min-w-[180px]">
          <p className="text-sm font-bold text-gray-700 text-center">
            {displayedText}
            <span
              className={`inline-block w-[2px] h-[1em] bg-gray-500 align-middle ml-[1px] transition-opacity duration-300 ${
                displayedText.length < bubbleMsg.length ? "animate-pulse" : "opacity-0"
              }`}
            />
          </p>
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0
            border-l-[10px] border-l-transparent
            border-r-[10px] border-r-transparent
            border-t-[12px] border-t-white"
          />
        </div>
        <div className="relative mt-4">
          <div
            onClick={handleCharacterTap}
            className="w-56 h-56 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden border border-white/80 cursor-pointer active:scale-95 transition-transform duration-150"
          >
            {selectedCharacter ? (
              <img
                src={selectedCharacter.image}
                alt=""
                className="h-55 w-55 select-none object-contain"
                draggable={false}
              />
            ) : (
              <span className="text-8xl select-none">🏃</span>
            )}
          </div>
          {characterName && (
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap">
              {characterName}
            </span>
          )}
          <span className="absolute top-3 right-5 text-xl animate-bounce">
            ✨
          </span>
          <span className="absolute bottom-8 left-1 text-lg animate-bounce delay-150">
            ⚡
          </span>
        </div>
      </div>

      {/* 스탯 카드 */}
      <div className="mx-4 mt-10 flex flex-col gap-4">
        {/* 운동 시작 버튼 */}
        <Link
          to="/workout"
          className="py-5 rounded-2xl font-extrabold text-center text-lg active:scale-95 transition block border-2"
          style={{
            color: "var(--color-primary)",
            borderColor: "var(--color-primary)",
            backgroundColor: "transparent",
            animation: "border-glow 2.4s ease-in-out infinite",
          }}
        >
          운동 시작하기
        </Link>

        {/* 이번주 운동 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">이번주 운동</span>
            </div>
            <span className="font-extrabold text-primary">
              {workoutDays}일
              <span className="text-gray-300 font-normal text-sm">
                {" "}
                / {workoutGoal}일
              </span>
            </span>
          </div>
          <ProgressBar
            value={workoutDays}
            max={workoutGoal}
            color="bg-gradient-to-r from-secondary to-primary"
          />
          <div className="flex justify-between pt-1">
            {["월", "화", "수", "목", "금", "토", "일"].map((day, i) => {
              const isWeekendDay = i >= 5;
              const didWorkout = weekWorkouts[i];
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      didWorkout && !isWeekendDay
                        ? "bg-primary text-white shadow-sm"
                        : didWorkout && isWeekendDay
                          ? "border-2 border-yellow-300 bg-yellow-50"
                          : "border-2 border-gray-100 text-gray-300"
                    }`}
                  >
                    {didWorkout && isWeekendDay ? "⭐" : day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* 오늘 목표 / 칼로리 */}
        {userGoal ? (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">오늘 목표</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-primary text-sm">
                  {userGoal.goal_type === "distance"
                    ? todayGoalValue.toFixed(2)
                    : Math.round(todayGoalValue).toLocaleString()}
                  {GOAL_TYPE_UNIT[userGoal.goal_type]}
                </span>
                <span className="text-gray-300 font-normal text-sm">
                  {" "}
                  / {userGoal.goal_value.toLocaleString()}
                  {GOAL_TYPE_UNIT[userGoal.goal_type]}
                </span>
              </div>
            </div>
            <ProgressBar
              value={todayGoalValue}
              max={userGoal.goal_value}
              color="bg-gradient-to-r from-primary to-secondary"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold">
                달성률 {goalPct}%
              </span>
              {goalPct >= 100 && (
                <span
                  className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                >
                  🏆 달성!
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span className="font-bold text-gray-700">
                  오늘 소모 칼로리
                </span>
              </div>
              <span className="font-extrabold text-primary">
                {burnedKcal} kcal
              </span>
            </div>
            <ProgressBar
              value={burnedKcal}
              max={500}
              color="bg-gradient-to-r from-primary to-secondary"
            />
            <Link
              to="/mypage"
              className="text-xs font-bold text-center py-1"
              style={{ color: "var(--color-primary)" }}
            >
              목표 설정하기 →
            </Link>
          </div>
        )}

        {/* 포인트 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">포인트 저금</span>
            </div>
            <span className="font-extrabold text-primary">
              {points} P
              <span className="text-gray-300 font-normal text-sm">
                {" "}
                / {pointGoal} P
              </span>
            </span>
          </div>
          <ProgressBar
            value={points}
            max={pointGoal}
            color="bg-gradient-to-r from-accent to-primary"
          />
        </div>
      </div>

      {/* 이번주 TOP 3 */}
      <div className="mx-4 mt-6 bg-white rounded-3xl shadow-sm">
        <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-50">
          <span className="text-lg">🏆</span>
          <span className="font-extrabold text-gray-700 text-sm">
            이번주 TOP 3
          </span>
        </div>
        <div className="flex flex-col">
          {weeklyTop3.map((user) => (
            <div
              key={user.rank}
              className="flex items-center gap-4 px-5 py-3.5"
              style={{ backgroundColor: user.bgColor }}
            >
              <span className="text-2xl w-8 text-center">{user.medal}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">
                  {user.name}
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: user.textColor }}
                >
                  {user.steps.toLocaleString()} 걸음
                </p>
              </div>
              <span className="text-xs font-extrabold text-gray-300">
                #{user.rank}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 오늘의 한마디 */}
      <div className="mx-4 mt-4 mb-6 rounded-2xl bg-gradient-to-r from-primary to-secondary p-4 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          {userGoal ? (
            <>
              <p className="text-white font-extrabold text-sm">
                {goalPct >= 100
                  ? "오늘 목표 달성! 최고야 🏆"
                  : `목표까지 ${100 - goalPct}% 남았어!`}
              </p>
              <p className="text-white/70 text-xs mt-0.5">
                지금 바로 나가서 달성해보자 💨
              </p>
            </>
          ) : (
            <>
              <p className="text-white font-extrabold text-sm">
                목표를 설정해보세요!
              </p>
              <p className="text-white/70 text-xs mt-0.5">
                칼로리·걸음수·거리 목표를 정할 수 있어요
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
