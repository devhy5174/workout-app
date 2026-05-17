import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useActivityType } from "../context/ActivityTypeContext";
import { useCharacter } from "../context/CharacterContext";
import { useUser } from "../context/UserContext";
import { storage } from "../utils/storage";
import {
  calculateStreak,
  getThisWeekWorkouts,
  localDateStr,
} from "../utils/streak";
import { getRandomMessage, getWeatherMessage } from "../data/characterMessages";
import { useWeather } from "../hooks/useWeather";
import { FAKE_ACTIVE_USERS } from "../data/fakeActiveUsers";
import { getActiveSessions } from "../lib/sessionService";
import { getAvatarCharacterById } from "../data/avatarCharacters";
import { useWeeklyTop3 } from "../hooks/useWeeklyTop3";
import { usePartyHighlights } from "../hooks/usePartyHighlights";
import { PartyHighlightTicker } from "../components/ui/PartyHighlightTicker";
import WeatherWidget from "../components/ui/WeatherWidget";

type DisplayUser = {
  nickname: string;
  character_image: string | null;
  activity: string;
  steps: number;
  isReal: boolean;
  title: string | null;
};

const workoutGoal = 7;

const ACTIVITY_LABEL: Record<string, string> = {
  walker: "산책 중",
  power_walker: "파워워킹 중",
  runner: "러닝 중",
  hiker: "등산 중",
};

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

const MEDAL_CONFIG = [
  { medal: "🥇", bgColor: "#fefce8", textColor: "#ca8a04" },
  { medal: "🥈", bgColor: "#f9fafb", textColor: "#6b7280" },
  { medal: "🥉", bgColor: "#fff7ed", textColor: "#fb923c" },
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

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "좋은 아침이에요";
  if (h >= 12 && h < 18) return "좋은 오후예요";
  if (h >= 18 && h < 22) return "좋은 저녁이에요";
  return "오늘도 수고했어요";
}

export default function Home() {
  const navigate = useNavigate();
  const { selectedActivityType } = useActivityType();
  const { selectedCharacter } = useCharacter();
  const { userGoal, workoutRecords, userProfile } = useUser();
  const {
    topParties,
    trendingParties,
    isLoading: highlightsLoading,
  } = usePartyHighlights();

  const activityTypeName = selectedActivityType?.name ?? null;

  const history = storage.getWorkoutHistory();
  const streak = calculateStreak(history);
  const weekWorkouts = getThisWeekWorkouts(history);
  const workoutDays = weekWorkouts.filter(Boolean).length;
  const burnedKcal = storage.getBurnedKcal();

  // 페이지 로드마다 캐릭터에 맞는 랜덤 메시지
  const activityType = selectedActivityType?.type ?? "walker";
  const { weather, condition: weatherCondition } = useWeather();
  const [bubbleMsg, setBubbleMsg] = useState(() =>
    getRandomMessage(activityType),
  );
  const [weatherMsgShown, setWeatherMsgShown] = useState(false);
  const displayedText = useTypingEffect(bubbleMsg);

  // 날씨 로드 완료 시 최초 1회 날씨 문구로 교체
  useEffect(() => {
    if (weatherCondition && !weatherMsgShown) {
      const msg = getWeatherMessage(weatherCondition);
      if (msg) {
        setBubbleMsg(msg);
        setWeatherMsgShown(true);
      }
    }
  }, [weatherCondition]);

  const [activeUsers, setActiveUsers] = useState<DisplayUser[]>([]);
  const { top3, isLoading: top3Loading } = useWeeklyTop3();

  useEffect(() => {
    async function buildActiveUsers() {
      let realUsers: DisplayUser[] = [];
      try {
        const sessions = await getActiveSessions();
        const shuffled = [...sessions].sort(() => Math.random() - 0.5);
        realUsers = shuffled.map((s) => ({
          nickname: s.nickname,
          character_image:
            getAvatarCharacterById(s.character_id)?.image ?? null,
          activity: s.exercise_type,
          steps: Math.floor(Math.random() * 5000) + 3000,
          isReal: true,
          title: s.title,
        }));
      } catch {}

      if (realUsers.length >= 8) {
        setActiveUsers(realUsers.slice(0, 8));
      } else {
        const needed = 8 - realUsers.length;
        const shuffledFake = [...FAKE_ACTIVE_USERS]
          .sort(() => Math.random() - 0.5)
          .slice(0, needed)
          .map((u) => ({
            nickname: u.nickname,
            character_image: u.character_image,
            activity: u.activity,
            steps: u.steps,
            isReal: false,
            title: null,
          }));
        setActiveUsers([...realUsers, ...shuffledFake]);
      }
    }
    buildActiveUsers();
  }, []);

  const handleCharacterTap = () => {
    if (weatherCondition && Math.random() < 0.3) {
      const msg = getWeatherMessage(weatherCondition);
      if (msg) {
        setBubbleMsg(msg);
        return;
      }
    }
    setBubbleMsg(getRandomMessage(activityType));
  };

  // 오늘 목표 진행률
  const today = localDateStr(new Date());
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
      {/* 상단 Streak + 날씨 */}
      <div className="flex justify-between items-center px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-primary-light rounded-full px-4 py-1.5">
          <span className="text-lg">🔥</span>
          <span className="font-extrabold text-primary text-sm">
            {streak}일 연속 운동 중!
          </span>
        </div>
        <WeatherWidget weather={weather} />
      </div>

      {/* 캐릭터 + 말풍선 */}
      <div className="flex flex-col items-center px-6 pt-4 pb-2 mb-3">
        <div className="relative bg-white rounded-2xl px-5 py-3 shadow-md mb-2 min-w-[180px]">
          <p className="text-sm font-bold text-gray-700 text-center">
            {displayedText}
            <span
              className={`inline-block w-[2px] h-[1em] bg-gray-500 align-middle ml-[1px] transition-opacity duration-300 ${
                displayedText.length < bubbleMsg.length
                  ? "animate-pulse"
                  : "opacity-0"
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
        <div className="relative mt-4 flex flex-col items-center">
          <div
            onClick={handleCharacterTap}
            className="w-56 h-56 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden border border-white/80 cursor-pointer active:scale-95 transition-transform duration-150"
          >
            {selectedCharacter ? (
              <img
                src={selectedCharacter.image}
                alt=""
                className="w-full h-full select-none object-contain"
                draggable={false}
              />
            ) : (
              <span className="text-8xl select-none">🏃</span>
            )}
          </div>
          <div className="text-center mt-3">
            {activityTypeName && (
              <span className="-bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap">
                {activityTypeName}
              </span>
            )}

            <p className="text-xl font-extrabold text-gray-800">
              {getGreeting()},{" "}
              {userProfile?.title ? `${userProfile.title.split(" ")[0]} ` : ""}
              {userProfile?.nickname ?? "운동왕"}님!
            </p>
          </div>

          <span className="absolute top-5 right-5 text-xl animate-bounce">
            ✨
          </span>
          <span className="absolute bottom-20 left-1 text-lg animate-bounce delay-150">
            ✨
          </span>
        </div>
      </div>

      {/* 실시간 운동 중 전광판 */}
      {activeUsers.length > 0 && (
        <div
          className="mx-4 mt-3 flex items-center gap-2.5 rounded-2xl overflow-hidden py-5 px-4"
          style={{ background: "var(--color-primary-light)" }}
        >
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--color-primary)" }}
            />
            <span
              className="text-[11px] font-extrabold whitespace-nowrap"
              style={{ color: "var(--color-primary)" }}
            >
              함께 운동중
            </span>
          </div>
          <div className="flex flex-1 items-center overflow-hidden min-w-0">
            <div
              className="marquee-track items-center"
              style={{ verticalAlign: "middle" }}
            >
              {[...activeUsers, ...activeUsers].map((user, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    margin: "0 12px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--color-primary)",
                      fontSize: 18,
                      lineHeight: 1,
                      opacity: 0.5,
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "white",
                      flexShrink: 0,
                    }}
                  >
                    {user.character_image ? (
                      <img
                        src={user.character_image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 14 }}>🏃</span>
                    )}
                  </span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: "var(--color-primary)", lineHeight: 1 }}
                  >
                    {user.title ? `${user.title.split(" ")[0]} ` : ""}
                    {user.nickname}님{" "}
                    {ACTIVITY_LABEL[user.activity] ?? "운동 중"}&nbsp;&nbsp;
                    {user.steps.toLocaleString()}보
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 스탯 카드 */}
      <div className="mx-4 mt-4 flex flex-col gap-4">
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
      </div>

      {/* 파티 활동 카드 */}
      <div className="mx-4 mt-4 bg-white rounded-3xl shadow-sm">
        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span className="font-extrabold text-gray-700 text-sm">
              파티 활동
            </span>
          </div>
          <button
            onClick={() => navigate("/party")}
            className="text-xs font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            전체보기 →
          </button>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          <PartyHighlightTicker
            icon="🔥"
            badge="오늘 최다"
            badgeStyle={{ color: "#ea580c", background: "#fff7ed" }}
            items={
              highlightsLoading
                ? []
                : topParties.map((p, i) => ({
                    text: `${["🥇", "🥈", "🥉"][i]} ${p.name} · ${p.value.toLocaleString()}보`,
                    partyId: p.id,
                  }))
            }
            emptyText={
              highlightsLoading
                ? "불러오는 중..."
                : "오늘 운동 기록이 아직 없어요"
            }
            onTap={() => navigate("/party")}
          />
          <PartyHighlightTicker
            icon="⚡"
            badge="실시간"
            badgeStyle={{ color: "#059669", background: "#ecfdf5" }}
            items={
              highlightsLoading
                ? []
                : trendingParties.map((p) => ({
                    text: `👥 ${p.name} · ${p.value}명 운동 중`,
                    partyId: p.id,
                  }))
            }
            emptyText={
              highlightsLoading
                ? "불러오는 중..."
                : "현재 운동 중인 파티가 없어요"
            }
            onTap={() => navigate("/party")}
          />
        </div>
      </div>

      {/* 이번주 TOP 3 */}
      <div className="mx-4 mt-3 bg-white rounded-3xl shadow-sm">
        <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-50">
          <span className="text-lg">🏆</span>
          <span className="font-extrabold text-gray-700 text-sm">
            이번주 TOP 3
          </span>
        </div>
        <div className="flex flex-col">
          {top3Loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-3 bg-gray-100 rounded w-24" />
                  <div className="h-2.5 bg-gray-100 rounded w-16" />
                </div>
              </div>
            ))
          ) : top3.length === 0 ? (
            <div className="px-5 py-6 text-center text-xs text-gray-400 font-semibold">
              이번주 아직 운동 기록이 없어요
            </div>
          ) : (
            top3.map((entry) => {
              const config = MEDAL_CONFIG[entry.rank - 1];
              const charImage =
                getAvatarCharacterById(entry.character_id)?.image ?? null;
              return (
                <div
                  key={entry.rank}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <span className="text-2xl w-8 text-center">
                    {config.medal}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    {charImage ? (
                      <img
                        src={charImage}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-base">🏃</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {entry.nickname}
                    </p>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: config.textColor }}
                    >
                      {entry.steps.toLocaleString()} 걸음
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-gray-300">
                    #{entry.rank}
                  </span>
                </div>
              );
            })
          )}
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
