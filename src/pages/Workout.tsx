import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaPause, FaStop, FaUsers } from "react-icons/fa";
import {
  IoTime,
  IoFootsteps,
  IoLocationSharp,
  IoFlame,
  IoSpeedometer,
} from "react-icons/io5";
import { MdBatteryAlert, MdDirectionsWalk } from "react-icons/md";
import AlertModal from "../components/ui/AlertModal";
import { lazy, Suspense } from "react";
const RouteMap = lazy(() => import("../components/ui/RouteMap"));
import { useActivityType } from "../context/ActivityTypeContext";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { getAvatarCharacterById } from "../data/avatarCharacters";
import { activityTypes } from "../data/activityTypes";
import { storage } from "../utils/storage";
import {
  startSession,
  updateSession,
  endSession,
  getActiveSessions,
} from "../lib/sessionService";
import { useActiveBubble } from "../context/ActiveBubbleContext";
import { DIET_BY_CHARACTER } from "../data/characterWorkoutDiet";
import { useTodayStats } from "../hooks/useTodayStats";
import { useYesterdayPace } from "../hooks/useYesterdayPace";
import { notifyGoalReached } from "../utils/notificationTriggers";
import { checkAndGrantEventRewards } from "../lib/eventService";
import { BUBBLE_PREVIEWS } from "../data/bubblePreviews";
import { HiSparkles } from "react-icons/hi2";
import WorkoutNative, { isNative } from "../lib/workoutNative";
import { codeToCondition } from "../hooks/useWeather";

// 세션스토리지에 캐시된 날씨에서 조건 문자열 추출 (API 재호출 없음)
function getCachedWeatherCondition(): string | undefined {
  try {
    const raw = sessionStorage.getItem("weather_cache_v1");
    if (!raw) return undefined;
    const { code, temp } = JSON.parse(raw);
    return codeToCondition(code, temp);
  } catch {
    return undefined;
  }
}

const WK_KEY = {
  state: "wk_state",
  steps: "wk_steps",
  elapsed: "wk_elapsed",
  resumeAt: "wk_resume_at",
  stepsAt: "wk_steps_at",
  activityType: "wk_activity_type",
  startDate: "wk_start_date", // 자정 날짜 변경 감지용 — 앱 종료 후 재실행 시에도 유지
  isSaved: "wk_is_saved",    // 리마운트 후 중복 저장 방지
};

const formatDateIso = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// 활동 유형별 분당 걸음수
const STEPS_PER_SEC: Record<string, number> = {
  walker: 100 / 60,
  power_walker: 120 / 60,
  runner: 150 / 60,
  hiker: 90 / 60,
};

const DIET_BY_DURATION = {
  light: {
    label: "가벼운 식단",
    meals: [
      { emoji: "🥗", name: "샐러드" },
      { emoji: "🍓", name: "과일" },
    ],
  },
  protein: {
    label: "단백질 보충",
    meals: [
      { emoji: "🍗", name: "닭가슴살" },
      { emoji: "🥚", name: "삶은계란" },
    ],
  },
};

const GOAL_TYPE_LABEL = {
  steps: "걸음수",
  distance: "거리",
  calories: "칼로리",
};

const ACTIVITY_LABEL: Record<string, string> = {
  walker: "워킹 중",
  power_walker: "파워워킹 중",
  runner: "러닝 중",
  hiker: "등산 중",
};

// 활동 유형별 스탯 레이아웃: primary = 크게 표시, secondary = 3개 소형 카드
const STAT_LAYOUT = {
  walker: { primary: "steps", secondary: ["calories", "distance", "time"] },
  power_walker: {
    primary: "distance",
    secondary: ["pace", "time", "calories"],
  },
  runner: { primary: "distance", secondary: ["pace", "time", "calories"] },
  hiker: { primary: "distance", secondary: ["time", "pace", "calories"] },
} as const;

type StatKey = "time" | "steps" | "distance" | "calories" | "pace";

// 각 stat 키별 아이콘 (large: 1차 카드용, small: 보조 카드용)
const STAT_ICON_LG = {
  time: <IoTime className="text-3xl text-violet-500" />,
  steps: <IoFootsteps className="text-3xl text-emerald-500" />,
  distance: <IoLocationSharp className="text-3xl text-blue-500" />,
  calories: <IoFlame className="text-3xl text-orange-500" />,
  pace: <IoSpeedometer className="text-3xl text-red-500" />,
} satisfies Record<StatKey, React.ReactElement>;

const STAT_ICON_SM = {
  time: <IoTime className="text-xl text-violet-500" />,
  steps: <IoFootsteps className="text-xl text-emerald-500" />,
  distance: <IoLocationSharp className="text-xl text-blue-500" />,
  calories: <IoFlame className="text-xl text-orange-500" />,
  pace: <IoSpeedometer className="text-xl text-red-500" />,
} satisfies Record<StatKey, React.ReactElement>;

const SVG_SIZE = 280;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;
const RADIUS = 108;
const STROKE_W = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type WorkoutState = "idle" | "running" | "paused" | "done";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export default function Workout() {
  const navigate = useNavigate();
  const { selectedActivityType, selectedId, selectActivityType } =
    useActivityType();
  const { user, userGoal, saveWorkout, userProfile } = useUser();
  const { theme } = useTheme();
  const { todayStats } = useTodayStats(user?.id ?? null);
  const { selectedBubbleId } = useActiveBubble();

  // Native는 항상 idle로 시작 — mount 시 getStatus()로 서비스 상태 복구
  const [state, setState] = useState<WorkoutState>(() =>
    isNative()
      ? "idle"
      : ((localStorage.getItem(WK_KEY.state) as WorkoutState) ?? "idle"),
  );
  const [steps, setSteps] = useState<number>(() =>
    isNative() ? 0 : Number(localStorage.getItem(WK_KEY.steps) ?? 0),
  );
  const [elapsed, setElapsed] = useState<number>(() =>
    isNative() ? 0 : Number(localStorage.getItem(WK_KEY.elapsed) ?? 0),
  );
  const yesterdayPace = useYesterdayPace(user?.id ?? null, elapsed, steps);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newlyGranted, setNewlyGranted] = useState<{ bubbleId?: string; titleText?: string }[]>([]);

  const [pendingId, setPendingId] = useState<number>(() => selectedId ?? 1);

  const [showBuddies, setShowBuddies] = useState(true);
  const [tooShort, setTooShort] = useState(false);
  const [savedRoutePoints, setSavedRoutePoints] = useState<
    { lat: number; lng: number; timestamp: number }[]
  >([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [estimationMode, setEstimationMode] = useState(false);
  const [showBatteryGuide, setShowBatteryGuide] = useState(false);

  // GPS distance tracking (distance/pace only — steps source stays step sensor)
  const [gpsDistance, setGpsDistance] = useState(0); // km
  const [distanceSource, setDistanceSource] = useState<"gps" | "estimated">(
    "estimated",
  );
  const gpsDistanceRef = useRef(0);
  const [showGpsModal, setShowGpsModal] = useState(false);

  const isSaved = useRef(false);
  const lastSavedAt = useRef<number>(0);
  const workoutStartDateRef = useRef<string>("");
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const stepsRef = useRef(steps);
  const isRestoredSessionRef = useRef(false);
  const stateRef = useRef<WorkoutState>(state);
  const prevStateRef = useRef<WorkoutState>("idle");
  const elapsedRef = useRef(elapsed);
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    gpsDistanceRef.current = gpsDistance;
  }, [gpsDistance]);

  // 링 주변 공전할 실유저 (최대 2명)
  const [buddies, setBuddies] = useState<
    { nickname: string; activity: string; character_image: string }[]
  >([]);
  useEffect(() => {
    getActiveSessions()
      .then((sessions) => {
        const real = sessions
          .filter((s) => s.user_id !== user?.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .map((s) => ({
            nickname: s.nickname,
            activity: s.exercise_type,
            character_image:
              getAvatarCharacterById(s.character_id)?.image ?? "",
          }));
        setBuddies(real);
      })
      .catch(() => {});
  }, [user?.id]);

  // 상태 localStorage 동기화
  useEffect(() => {
    localStorage.setItem(WK_KEY.state, state);
    localStorage.setItem(WK_KEY.steps, String(steps));
    localStorage.setItem(WK_KEY.elapsed, String(elapsed));
  }, [state, steps, elapsed]);

  const characterEmoji = selectedActivityType?.emoji ?? "🏃";
  const characterImage =
    getAvatarCharacterById(userProfile?.character_id ?? null)?.image ?? null;
  const kcalPerMin = selectedActivityType?.kcalPerMin ?? 4;
  const actType = selectedActivityType?.type ?? "walker";
  const stepsPerMin = (STEPS_PER_SEC[actType] ?? STEPS_PER_SEC.walker) * 60;
  // stride: 키 있으면 신체 기반(height × 0.415 / 100 m), 없으면 기본 0.7m
  const stride = userProfile?.height ? (userProfile.height * 0.415) / 100 : 0.7;
  const distance = parseFloat(((steps * stride) / 1000).toFixed(2));
  const calories = Math.floor((steps * kcalPerMin) / stepsPerMin);
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;
  const durationLabel =
    elapsedMin > 0 ? `${elapsedMin}분 ${elapsedSec}초` : `${elapsedSec}초`;

  // ── 목표 기반 게이지 ─────────────────────────────────
  const goalType = userGoal?.goal_type ?? "steps";
  const goalValue = userGoal?.goal_value ?? 5000;

  const alreadySteps = todayStats.steps;
  const alreadyDistance = todayStats.distance;
  const alreadyCalories = todayStats.calories;

  const sessionSteps = steps;
  const sessionDistance = distance;
  const sessionCalories = calories;

  const currentGoalValue =
    goalType === "steps"
      ? sessionSteps
      : goalType === "distance"
        ? sessionDistance
        : sessionCalories;

  const todayTotalText =
    goalType === "steps"
      ? `오늘 누적 ${alreadySteps.toLocaleString()}보`
      : goalType === "distance"
        ? `오늘 누적 ${alreadyDistance.toFixed(2)}km`
        : `오늘 누적 ${alreadyCalories}kcal`;

  const goalProgress = Math.min((currentGoalValue / goalValue) * 100, 100);

  const remainingText =
    goalType === "steps"
      ? `${Math.max(0, Math.ceil(goalValue - currentGoalValue)).toLocaleString()}보 남음`
      : goalType === "distance"
        ? `${Math.max(0, goalValue - currentGoalValue).toFixed(2)}km 남음`
        : `${Math.max(0, Math.ceil(goalValue - currentGoalValue))}kcal 남음`;

  const goalLabelText = userGoal
    ? `목표 ${goalType === "steps" ? `${goalValue.toLocaleString()}보` : goalType === "distance" ? `${goalValue}km` : `${goalValue}kcal`}`
    : "목표 5,000보";

  const dashOffset = CIRCUMFERENCE * (1 - goalProgress / 100);
  const angle = (goalProgress / 100) * 2 * Math.PI - Math.PI / 2;
  const emojiX = CX + RADIUS * Math.cos(angle);
  const emojiY = CY + RADIUS * Math.sin(angle);

  const charDiet = selectedActivityType
    ? DIET_BY_CHARACTER[selectedActivityType.id]
    : null;
  const durationDiet =
    elapsedMin >= 30 ? DIET_BY_DURATION.protein : DIET_BY_DURATION.light;

  // 운동 시작 날짜 기록 — 자정 날짜 변경 감지에 사용
  // localStorage에도 저장해 앱 강제종료 후 재실행 시에도 시작 날짜 유지
  useEffect(() => {
    if (state === "running" && !workoutStartDateRef.current) {
      // 앱 재실행 시 저장된 시작 날짜 복원 (없으면 오늘 날짜로 신규 기록)
      const persisted = localStorage.getItem(WK_KEY.startDate);
      const today = formatDateIso(new Date());
      const startDate = persisted ?? today;
      workoutStartDateRef.current = startDate;
      localStorage.setItem(WK_KEY.startDate, startDate);
    }
    if (state === "idle") {
      workoutStartDateRef.current = "";
      // clearWorkoutSession이 WK_KEY 전체를 지우므로 별도 제거 불필요
    }
  }, [state]);

  // 목표 달성 시 자동 완료 + 1회 저장
  // 서비스도 함께 종료해야 재마운트 시 중복 저장 방지 가능
  useEffect(() => {
    if (state === "running" && goalProgress >= 100) {
      setState("done");
      if (isNative() && !estimationMode) {
        WorkoutNative.stopWorkout().catch(() => {});
      }
      performSave();
    }
  }, [state, goalProgress]);

  const clearWorkoutSession = () => {
    Object.values(WK_KEY).forEach((k) => localStorage.removeItem(k));
  };

  // overrideSteps/overrideElapsed: handleStop에서 서비스 종료 전 가져온 정확한 값
  // overrideDate: 자정 자동 저장 시 실제 운동 날짜(어제 날짜)를 지정
  const performSave = async (
    overrideSteps?: number,
    overrideElapsed?: number,
    overrideDate?: string,
  ) => {
    if (isSaved.current) return;
    if (localStorage.getItem(WK_KEY.isSaved) === "1") return;
    const now = Date.now();
    if (now - lastSavedAt.current < 60_000) return;
    isSaved.current = true;
    lastSavedAt.current = now;
    localStorage.setItem(WK_KEY.isSaved, "1");

    const finalSteps = overrideSteps ?? stepsRef.current;
    const currentElapsedRef = overrideElapsed ?? elapsedRef.current;
    const strideVal = userProfile?.height
      ? (userProfile.height * 0.415) / 100
      : 0.7;
    const estimatedDistance = parseFloat(
      ((finalSteps * strideVal) / 1000).toFixed(2),
    );
    // Prefer GPS distance when available — more accurate for runner/hiker
    const gpsKm = gpsDistanceRef.current;
    const finalDistance =
      gpsKm > 0 ? parseFloat(gpsKm.toFixed(2)) : estimatedDistance;
    const finalDistanceSource: "gps" | "estimated" =
      gpsKm > 0 ? "gps" : "estimated";

    if (currentElapsedRef < 30 || finalSteps < 50) {
      console.warn(
        "[performSave] 너무 짧은 운동 — elapsed:",
        currentElapsedRef,
        "finalSteps:",
        finalSteps,
      );
      setTooShort(true);
      clearWorkoutSession();
      if (user) endSession(user.id);
      return;
    }
    setTooShort(false);

    const currentCalories = Math.floor((finalSteps * kcalPerMin) / stepsPerMin);
    const currentElapsed = currentElapsedRef;

    if (user) endSession(user.id);

    storage.setBurnedKcal((storage.getBurnedKcal() ?? 0) + currentCalories);
    storage.addWorkoutToday();
    storage.setRecommendedDiet({
      durationLabel:
        Math.floor(currentElapsed / 60) >= 30
          ? "⏱ 30분 이상 운동 — 단백질 보충 필요!"
          : "⏱ 30분 미만 운동 — 가벼운 식단 추천",
      durationMeals: durationDiet.meals,
      characterEmoji: selectedActivityType?.emoji,
      characterName: selectedActivityType?.name,
      characterMeals: charDiet?.meals,
      tip: charDiet?.tip,
    });

    const todayIso = overrideDate ?? formatDateIso(new Date());

    // 평균 페이스 (분/km) — GPS 거리 기준, 없으면 추정 거리 기준
    const avgPace =
      finalDistance > 0
        ? parseFloat((currentElapsedRef / 60 / finalDistance).toFixed(2))
        : undefined;

    // GPS 경로 수집 — 네이티브에서 직렬화된 JSON 읽어옴
    let routePoints:
      | { lat: number; lng: number; timestamp: number }[]
      | undefined;
    if (isNative()) {
      try {
        const { json } = await WorkoutNative.getRoutePoints();
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          routePoints = parsed;
          setSavedRoutePoints(parsed);
        }
      } catch {
        // 경로 수집 실패해도 운동 저장은 정상 진행
      }
    }

    const saveResult = await saveWorkout({
      date: todayIso,
      duration: currentElapsed,
      distance: finalDistance,
      steps: finalSteps,
      calories: currentCalories,
      workout_type: selectedActivityType?.type ?? "walker",
      goal_achieved: goalProgress >= 100,
      gps_distance: gpsKm > 0 ? parseFloat(gpsKm.toFixed(2)) : undefined,
      distance_source: finalDistanceSource,
      avg_pace: avgPace,
      route_points: routePoints,
      weather_condition: getCachedWeatherCondition(),
    });

    if (saveResult.error) {
      console.error("운동 저장 실패 — Supabase 에러:", saveResult.error);
      return;
    }

    // 이벤트 달성 자동 지급 — 신규 지급 항목 있으면 팝업
    if (user) {
      checkAndGrantEventRewards(user.id)
        .then((grants) => { if (grants.length > 0) setNewlyGranted(grants); })
        .catch(() => {});
    }

    // 목표 달성 알림 (fire-and-forget)
    if (goalProgress >= 100 && user && userGoal) {
      notifyGoalReached({
        userId: user.id,
        goalType: userGoal.goal_type,
        goalValue: userGoal.goal_value,
      }).catch(() => {});
    }
  };

  // GPS 모달 이후 공통 진행 로직 (배터리 최적화 → 운동 시작)
  const proceedToRunning = async () => {
    try {
      const batteryGuideShown = localStorage.getItem("battery_guide_shown");
      if (!batteryGuideShown) {
        const { excluded } =
          await WorkoutNative.isBatteryOptimizationExcluded();
        if (!excluded) {
          setShowBatteryGuide(true);
          return;
        }
      }
    } catch (_) {}
    setState("running");
  };

  const startWorkoutWithPermission = async () => {
    if (!isNative()) {
      setState("running");
      return;
    }
    try {
      // 1. 활동 인식 권한
      const { granted } = await WorkoutNative.checkActivityPermission();
      if (!granted) {
        setPermissionDenied(false);
        setShowPermissionModal(true);
        return;
      }
      // 2. GPS 권한: 없으면 자체 안내 모달 먼저 — 바로 Android 팝업 노출하지 않음
      const { granted: gpsGranted } =
        await WorkoutNative.checkLocationPermission();
      if (!gpsGranted) {
        setShowGpsModal(true);
        return; // 이후 플로우는 GPS 모달 버튼 콜백에서 처리
      }
      // 3. GPS 이미 허용 → 배터리 최적화 → 운동 시작
      await proceedToRunning();
    } catch {
      setState("running");
    }
  };

  const handleStop = async () => {
    // 서비스 종료 전 최종 센서값 가져오기 (notification steps = saved steps 보장)
    let serviceSteps: number | undefined;
    let serviceElapsed: number | undefined;
    if (isNative() && !estimationMode) {
      try {
        const status = await WorkoutNative.getStatus();
        console.log("[FINAL_SNAPSHOT]", {
          serviceRunning: status.isRunning,
          notificationSteps: status.steps,
          uiSteps: stepsRef.current,
          serviceElapsed: status.elapsed,
          uiElapsed: elapsedRef.current,
          isPaused: status.isPaused,
          estimationMode: false,
        });
        if (status.isRunning) {
          serviceSteps = status.steps;
          serviceElapsed = status.elapsed;
        }
      } catch (_) {}
      WorkoutNative.stopWorkout().catch(() => {});
    } else if (estimationMode) {
      console.log("[FINAL_SNAPSHOT]", {
        serviceRunning: false,
        uiSteps: stepsRef.current,
        uiElapsed: elapsedRef.current,
        estimationMode: true,
      });
    }
    setState("done");
    await performSave(serviceSteps, serviceElapsed);
    setShowModal(true);
  };

  // 앱 재실행 시 백그라운드 경과 시간 복구 — 웹 전용 (네이티브는 getStatus()로 복구)
  useEffect(() => {
    if (isNative()) return;
    if (state !== "running") return;
    const resumeAt = Number(localStorage.getItem(WK_KEY.resumeAt) ?? 0);
    if (!resumeAt) return;
    const missedSec = Math.floor((Date.now() - resumeAt) / 1000);
    if (missedSec <= 2) return;
    const actType =
      localStorage.getItem(WK_KEY.activityType) ??
      selectedActivityType?.type ??
      "walker";
    const missedSteps = Math.round(
      missedSec * (STEPS_PER_SEC[actType] ?? STEPS_PER_SEC.walker),
    );
    setElapsed((prev) => prev + missedSec);
    setSteps((prev) => prev + missedSteps);
    localStorage.removeItem(WK_KEY.resumeAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wake Lock: 운동 중 화면 자동 꺼짐 방지
  useEffect(() => {
    if (state !== "running") {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
      return;
    }
    if (!("wakeLock" in navigator)) return;
    navigator.wakeLock
      .request("screen")
      .then((lock) => {
        wakeLockRef.current = lock;
      })
      .catch(() => {});
    // 화면이 잠깐 꺼졌다 켜지면 재요청
    const onVisible = () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        navigator.wakeLock
          .request("screen")
          .then((lock) => {
            wakeLockRef.current = lock;
          })
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [state]);

  // 세션 시작/종료
  useEffect(() => {
    if (state === "running" && user) {
      startSession(
        user.id,
        selectedActivityType?.type ?? "walker",
        selectedBubbleId,
      );
    }
  }, [state === "running"]);

  // 30초마다 last_seen 갱신
  useEffect(() => {
    if (state !== "running" || !user) return;
    const id = setInterval(() => updateSession(user.id), 30_000);
    return () => clearInterval(id);
  }, [state, user]);

  // 운동 시작/재개 시 resumeAt 저장, 정지/완료 시 제거
  // 네이티브 앱이면 ForegroundService도 연동
  useEffect(() => {
    if (state === "running") {
      localStorage.setItem(WK_KEY.resumeAt, String(Date.now()));
      localStorage.setItem(
        WK_KEY.activityType,
        selectedActivityType?.type ?? "walker",
      );
    } else {
      localStorage.removeItem(WK_KEY.resumeAt);
    }
  }, [state, selectedActivityType]);

  // 네이티브: 백그라운드 복구 — mount 시 + 포그라운드 복귀 시 서비스 상태 확인
  useEffect(() => {
    if (!isNative()) return;

    const restoreFromNative = async () => {
      try {
        const status = await WorkoutNative.getStatus();
        if (status.isRunning) {
          const targetState: WorkoutState = status.isPaused
            ? "paused"
            : "running";
          // 현재 state와 다를 때만 flag 설정 (같으면 effect가 다시 안 뜨므로 불필요)
          if (stateRef.current !== targetState) {
            isRestoredSessionRef.current = true;
          }
          const nativeSteps = status.steps ?? 0;
          const nativeElapsed = status.elapsed ?? 0;
          setSteps(nativeSteps);
          stepsRef.current = nativeSteps;
          setElapsed(nativeElapsed);
          elapsedRef.current = nativeElapsed;
          const nativeGpsKm = status.gpsDistanceKm ?? 0;
          if (nativeGpsKm > 0) {
            setGpsDistance(nativeGpsKm);
            gpsDistanceRef.current = nativeGpsKm;
            setDistanceSource("gps");
          }
          setState(targetState);
        } else if (
          stateRef.current === "running" ||
          stateRef.current === "paused"
        ) {
          // 서비스가 종료됐는데 React는 진행 중으로 알고 있는 경우 (알림에서 종료)
          clearWorkoutSession();
          setState("idle");
        }
      } catch (_) {}
    };

    restoreFromNative();

    const onVisible = () => {
      if (document.visibilityState === "visible") restoreFromNative();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 네이티브: 상태 변화에 따라 ForegroundService 제어 (estimationMode면 서비스 시작 안 함)
  useEffect(() => {
    if (!isNative() || estimationMode) return;
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    if (state === "running") {
      // 백그라운드 복구 세션이면 서비스 이미 살아있음 — startWorkout 생략
      if (isRestoredSessionRef.current) {
        isRestoredSessionRef.current = false;
        return;
      }
      // paused → running: ACTION_RESUME (이 경로에서 startWorkout 하면 카운터 초기화됨)
      if (prev === "paused") {
        WorkoutNative.resumeWorkout().catch(() => {});
      } else {
        WorkoutNative.startWorkout({
          activityType: selectedActivityType?.type ?? "walker",
          nickname: userProfile?.nickname ?? "",
          characterId: userProfile?.character_id ?? "",
          theme,
        }).catch(() => {});
      }
    } else if (state === "paused") {
      // 복구된 세션이면 이미 서비스가 paused 상태 — pauseWorkout 중복 호출 방지
      if (isRestoredSessionRef.current) {
        isRestoredSessionRef.current = false;
        return;
      }
      WorkoutNative.pauseWorkout().catch(() => {});
    }
  }, [state]);

  // 네이티브: WorkoutService TYPE_STEP_COUNTER 센서 이벤트 → UI 동기화
  useEffect(() => {
    if (!isNative()) return;
    let listener: { remove: () => void } | null = null;
    WorkoutNative.addListener("workoutUpdate", (data) => {
      // elapsed: JS 타이머와 2초 이상 차이날 때만 서비스 값으로 보정
      setElapsed((prev) =>
        Math.abs(data.elapsed - prev) > 2 ? data.elapsed : prev,
      );
      // steps: 항상 서비스 센서값으로 동기화 (single source of truth)
      setSteps(data.steps);
      stepsRef.current = data.steps;
      // GPS distance: monotonically increasing, only update when GPS is active
      if (data.distanceSource === "gps" && data.gpsDistance > 0) {
        setGpsDistance((prev) => Math.max(prev, data.gpsDistance));
        gpsDistanceRef.current = Math.max(
          gpsDistanceRef.current,
          data.gpsDistance,
        );
        setDistanceSource("gps");
      }
    })
      .then((l) => {
        listener = l;
      })
      .catch(() => {});
    return () => {
      listener?.remove();
    };
  }, []);

  // 걸음 수 증가 시뮬레이션 — 웹 또는 권한 거절(estimationMode) 시
  useEffect(() => {
    if (state !== "running" || (isNative() && !estimationMode)) return;
    const intervalMap: Record<string, number> = {
      walker: 600, // 분당 100보
      power_walker: 500, // 분당 120보
      runner: 400, // 분당 150보
      hiker: 667, // 분당 90보
    };
    const ms = intervalMap[selectedActivityType?.type ?? "walker"] ?? 600;
    const id = setInterval(() => {
      setSteps((prev) => {
        const next = prev + 1;
        stepsRef.current = next;
        // resumeAt/steps 갱신 (백그라운드 복구 기준점)
        localStorage.setItem(WK_KEY.resumeAt, String(Date.now()));
        localStorage.setItem(WK_KEY.steps, String(next));
        return next;
      });
    }, ms);
    return () => clearInterval(id);
  }, [state, selectedActivityType, estimationMode]);

  // 타이머 (1초마다) + 자정 날짜 변경 자동 저장
  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      setElapsed((prev) => prev + 1);

      // 자정 감지: 운동 시작일과 현재 날짜가 다르면 자동 저장 후 종료
      const savedStart = workoutStartDateRef.current;
      if (!savedStart) return;
      const todayStr = formatDateIso(new Date());
      if (todayStr === savedStart) return;

      workoutStartDateRef.current = ""; // 재진입 방지
      (async () => {
        let serviceSteps: number | undefined;
        let serviceElapsed: number | undefined;
        if (isNative() && !estimationMode) {
          try {
            const status = await WorkoutNative.getStatus();
            if (status.isRunning) {
              serviceSteps = status.steps;
              serviceElapsed = status.elapsed;
            }
          } catch {}
          WorkoutNative.stopWorkout().catch(() => {});
        }
        setState("done");
        // savedStart(어제 날짜)로 저장해 날짜별 기록이 올바르게 분리되도록 함
        await performSave(serviceSteps, serviceElapsed, savedStart);
      })();
    }, 1000);
    return () => clearInterval(id);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // GPS 우선 거리 (steps 기반 추정의 fallback)
  const effectiveDistance =
    distanceSource === "gps" && gpsDistance > 0 ? gpsDistance : distance;

  // 러너 페이스 계산 — GPS 거리 기준 (없으면 추정 거리)
  const paceMinPerKm =
    effectiveDistance > 0 ? elapsed / 60 / effectiveDistance : 0;
  const paceStr =
    effectiveDistance > 0
      ? `${Math.floor(paceMinPerKm)}'${String(Math.round((paceMinPerKm % 1) * 60)).padStart(2, "0")}"`
      : `--'--"`;

  // 활동 유형별 스탯 데이터
  const allStatItems: Record<
    StatKey,
    { label: string; value: string; unit: string }
  > = {
    time: { label: "시간", value: formatTime(elapsed), unit: "시간" },
    steps: { label: "걸음수", value: steps.toLocaleString(), unit: "보" },
    distance: {
      label: "거리",
      value: effectiveDistance.toFixed(2),
      unit: "km",
    },
    calories: { label: "칼로리", value: String(calories), unit: "kcal" },
    pace: { label: "페이스", value: paceStr, unit: "/km" },
  };

  const statLayout =
    STAT_LAYOUT[actType as keyof typeof STAT_LAYOUT] ?? STAT_LAYOUT.walker;
  const primaryStat = {
    ...allStatItems[statLayout.primary],
    iconLg: STAT_ICON_LG[statLayout.primary],
  };
  const secondaryStats = statLayout.secondary.map((k) => ({
    ...allStatItems[k],
    iconSm: STAT_ICON_SM[k],
  }));

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-10 pb-2">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg text-gray-500 active:scale-90 transition"
        >
          ←
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <h1 className="font-extrabold text-gray-800">운동 트래킹</h1>
          {selectedActivityType && (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              {selectedActivityType.emoji} {selectedActivityType.name} ·{" "}
              {kcalPerMin}
              kcal/분
            </span>
          )}
        </div>
        <button
          onClick={() => setShowBuddies((v) => !v)}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition"
          aria-label={showBuddies ? "친구 숨기기" : "친구 보이기"}
        >
          <FaUsers
            className="text-base"
            style={{ color: showBuddies ? "var(--color-primary)" : "#9ca3af" }}
          />
        </button>
      </div>

      {/* 목표 뱃지 */}
      <div className="flex flex-col items-center  mt-1 mb-0">
        {userGoal ? (
          <button
            onClick={() => navigate("/mypage?tab=info")}
            aria-label="운동 목표 설정"
            className="text-xs font-bold px-3 py-1 rounded-full bg-white shadow-sm text-gray-500 active:scale-95 transition"
          >
            🎯 {GOAL_TYPE_LABEL[userGoal.goal_type]} 목표 ·{" "}
            {goalValue.toLocaleString()}
            {userGoal.goal_type === "steps"
              ? "보"
              : userGoal.goal_type === "distance"
                ? "km"
                : "kcal"}
          </button>
        ) : (
          <button
            onClick={() => navigate("/mypage?tab=info")}
            aria-label="운동 목표 설정"
            className="text-xs text-gray-400 active:scale-95 transition"
          >
            목표 없음 · 기본 5,000보
          </button>
        )}
        {/* 오늘 누적 */}
        <p className="text-[11px] text-gray-400 mt-1 font-semibold">
          {todayTotalText}
        </p>
      </div>

      {/* 상태 텍스트 */}
      <p
        className="text-center text-sm font-semibold mt-1 mb-0"
        style={{ color: "var(--color-primary)" }}
      >
        {state === "idle" && "시작 버튼을 눌러보세요!"}
        {state === "running" && "🔥 운동 중이에요!"}
        {state === "paused" && (
          <span className="inline-flex items-center justify-center gap-1">
            <FaPause /> 일시정지됨
          </span>
        )}
        {state === "done" && "🎉 목표 달성! 대단해요!"}
      </p>

      {/* 링 + 캐릭터 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          <svg width={SVG_SIZE} height={SVG_SIZE}>
            <defs>
              <linearGradient id="ringGrad" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-secondary)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="var(--color-ring-track)"
              strokeWidth={STROKE_W}
            />
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth={STROKE_W}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
              filter={state === "running" ? "url(#glow)" : undefined}
              style={{ transition: "stroke-dashoffset 0.12s ease" }}
            />
          </svg>

          {state !== "idle" && (
            <div
              className="absolute w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-xl z-10"
              style={{
                left: emojiX - 20,
                top: emojiY - 20,
                transition: "left 0.12s ease, top 0.12s ease",
              }}
            >
              {characterImage ? (
                <img
                  src={characterImage}
                  alt=""
                  className="w-full h-full object-contain rounded-full"
                />
              ) : (
                <span>{characterEmoji}</span>
              )}
            </div>
          )}

          {/* 친구 아바타 - 링 3시/9시 고정 + float */}
          <style>{`
            @keyframes buddy-float {
              0%, 100% { transform: translateY(0px); }
              50%       { transform: translateY(-6px); }
            }
          `}</style>
          {showBuddies &&
            buddies.map((buddy, i) => {
              const isRight = i === 0;
              return (
                <div
                  key={i}
                  className="absolute flex flex-col items-center pointer-events-none"
                  style={{
                    top: CY - 18,
                    ...(isRight
                      ? { left: CX + RADIUS + STROKE_W + 6 }
                      : { right: SVG_SIZE - (CX - RADIUS - STROKE_W - 6) }),
                    animation: `buddy-float ${3 + i * 0.7}s ease-in-out infinite`,
                    animationDelay: `${i * 0.4}s`,
                  }}
                >
                  <div className="bg-white shadow-sm rounded-full px-2 py-0.5 flex items-center gap-1 whitespace-nowrap mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <span className="text-[8px] font-bold text-gray-600">
                      {buddy.nickname}{" "}
                      {ACTIVITY_LABEL[buddy.activity] ?? "운동 중"}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
                    <img
                      src={buddy.character_image}
                      alt={buddy.nickname}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              );
            })}

          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            {state === "idle" && (
              <button
                onClick={() => {
                  setPendingId(selectedId ?? 1);
                  setShowStartModal(true);
                }}
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                <FaPlay className="text-white text-2xl" />
                <span className="text-white font-extrabold text-xs mt-0.5">
                  시작
                </span>
              </button>
            )}
            {(state === "running" || state === "paused") && (
              <>
                <p className="text-5xl font-extrabold text-gray-800 leading-none">
                  {Math.floor(goalProgress)}
                  <span className="text-2xl text-gray-400">%</span>
                </p>
                <p className="text-xs text-gray-400 mt-1 font-semibold">
                  {goalLabelText}
                </p>
                <p
                  className="text-xs font-bold mt-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  {remainingText}
                </p>
              </>
            )}
            {state === "done" && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl">🎉</span>
                <p
                  className="font-extrabold text-xl"
                  style={{ color: "var(--color-primary)" }}
                >
                  완료!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 어제 기록 페이서 배너 */}
        {(state === "running" || state === "paused") &&
          yesterdayPace !== null && (
            <div className="w-full bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">어제 이 시점</span>
                <span className="text-xs font-bold text-gray-500">
                  {yesterdayPace.expectedSteps.toLocaleString()}보
                </span>
              </div>
              <span
                className={`text-xs font-extrabold ${yesterdayPace.diff >= 0 ? "text-emerald-500" : "text-red-400"}`}
              >
                {yesterdayPace.diff >= 0
                  ? `+${yesterdayPace.diff.toLocaleString()}보 앞서는 중 🔥`
                  : `${Math.abs(yesterdayPace.diff).toLocaleString()}보 뒤처지는 중 💪`}
              </span>
            </div>
          )}

        {/* 스탯 카드 - 활동 유형별 레이아웃 */}
        <div className="w-full flex flex-col gap-2">
          {/* 메인 지표 — 활동 유형에 따라 걸음수 or 거리 크게 표시 */}
          {statLayout.primary === "distance" ? (
            /* 거리+걸음수 2열 메인 카드 (runner / power_walker / hiker) */
            <div className="w-full bg-white rounded-2xl px-5 py-4 flex items-center shadow-sm">
              {/* 거리 */}
              <div className="flex-1 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-primary-light)" }}
                >
                  <IoLocationSharp className="text-2xl text-blue-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <p className="font-extrabold text-3xl text-gray-800 leading-none">
                      {primaryStat.value}
                    </p>
                    <p className="text-sm text-gray-400 font-semibold">
                      {primaryStat.unit}
                    </p>
                  </div>
                  {(actType === "runner" ||
                    actType === "hiker" ||
                    actType === "power_walker") &&
                    (state === "running" || state === "paused") && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full self-start ${
                          distanceSource === "gps"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {distanceSource === "gps" ? "📍 GPS" : "📍 추정"}
                      </span>
                    )}
                </div>
              </div>
              {/* 구분선 */}
              <div className="w-px h-12 bg-gray-100 mx-3 flex-shrink-0" />
              {/* 걸음수 */}
              <div className="flex-1 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-primary-light)" }}
                >
                  <IoFootsteps className="text-2xl text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="font-extrabold text-3xl text-gray-800 leading-none">
                    {steps.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400 font-semibold">보</p>
                </div>
              </div>
            </div>
          ) : (
            /* 단일 메인 카드 (walker — 걸음수만) */
            <div className="w-full bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-primary-light)" }}
              >
                {primaryStat.iconLg}
              </div>
              <div className="flex items-baseline gap-1">
                <p className="font-extrabold text-4xl text-gray-800 leading-none">
                  {primaryStat.value}
                </p>
                <p className="text-sm text-gray-400 font-semibold">
                  {primaryStat.unit}
                </p>
              </div>
            </div>
          )}
          {/* 보조 지표 3개 */}
          <div className="w-full grid grid-cols-3 gap-2">
            {secondaryStats.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1 shadow-sm"
              >
                {s.iconSm}
                <p className="font-extrabold text-gray-800 text-base leading-none mt-1">
                  {s.value}
                </p>
                <p className="text-[10px] text-gray-400">{s.unit}</p>
                {actType === "walker" &&
                  s.label === "거리" &&
                  (state === "running" || state === "paused") && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        distanceSource === "gps"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {distanceSource === "gps" ? "📍 GPS" : "📍 추정"}
                    </span>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex gap-3 w-full pb-10">
          {state === "idle" && (
            <button
              onClick={() => {
                setPendingId(selectedId ?? 1);
                setShowStartModal(true);
              }}
              className="flex-1 py-4 rounded-2xl text-white font-extrabold shadow-md active:scale-95 transition flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              운동 시작
            </button>
          )}
          {state === "running" && (
            <>
              <button
                onClick={() => setState("paused")}
                className="flex-1 py-4 rounded-2xl bg-white shadow-sm font-extrabold text-gray-600 border border-gray-100 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <FaPause className="text-gray-500 text-base" /> 일시정지
              </button>
              <button
                onClick={handleStop}
                className="flex-1 py-4 rounded-2xl bg-gray-100 font-extrabold text-gray-500 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <FaStop className="text-gray-400 text-base" /> 종료
              </button>
            </>
          )}
          {state === "paused" && (
            <>
              <button
                onClick={() => setState("running")}
                className="flex-1 py-4 rounded-2xl text-white font-extrabold shadow-md active:scale-95 transition flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                <FaPlay className="text-white text-base" /> 재개
              </button>
              <button
                onClick={handleStop}
                className="flex-1 py-4 rounded-2xl bg-gray-100 font-extrabold text-gray-500 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <FaStop className="text-gray-400 text-base" /> 종료
              </button>
            </>
          )}
          {state === "done" && (
            <>
              <button
                onClick={() => {
                  setSteps(0);
                  setElapsed(0);
                  setGpsDistance(0);
                  gpsDistanceRef.current = 0;
                  setDistanceSource("estimated");
                  isSaved.current = false;
                  setTooShort(false);
                  setEstimationMode(false);
                  setState("idle");
                  clearWorkoutSession();
                }}
                className="flex-1 py-4 rounded-2xl bg-gray-100 font-extrabold text-gray-600 active:scale-95 transition"
              >
                다시 도전하기
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 py-4 rounded-2xl text-white font-extrabold shadow-md active:scale-95 transition"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                🎉 결과 보기
              </button>
            </>
          )}
        </div>
      </div>

      {/* 운동 시작 팝업 */}
      {showStartModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowStartModal(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-extrabold text-gray-800 text-lg">
                운동 유형 선택
              </p>
              <button
                onClick={() => setShowStartModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              선택한 유형으로 칼로리가 계산돼요
            </p>
            <div className="flex flex-col gap-3 mb-5">
              {activityTypes.map((c) => {
                const isActive = pendingId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setPendingId(c.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      isActive
                        ? `${c.bg} ${c.border}`
                        : "bg-gray-50 border-transparent"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl flex-shrink-0`}
                    >
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-gray-800 text-sm">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-400">{c.style}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-extrabold text-sm"
                        style={{
                          color: isActive ? "var(--color-primary)" : "#9ca3af",
                        }}
                      >
                        {c.kcalPerMin}kcal/분
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                selectActivityType(pendingId);
                setShowStartModal(false);
                startWorkoutWithPermission();
              }}
              className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              시작하기
            </button>
          </div>
        </div>
      )}

      {/* GPS 위치 권한 안내 */}
      {showGpsModal && (
        <AlertModal
          icon={IoLocationSharp}
          iconClass="text-blue-500"
          title="더 정확한 거리 기록"
          message={
            <div className="space-y-2 text-center">
              <p>
                실제 이동 거리와 평균 페이스를 기록하려면
                <br />
                <strong className="text-gray-700">위치 권한</strong>이 필요해요.
              </p>
              <p className="text-xs text-gray-400 pt-1">
                위치 정보는 운동 중 거리 계산에만 사용됩니다.
                <br />
                권한 없이도 걸음수 기반 추정 거리로 계속할 수 있어요.
              </p>
            </div>
          }
          confirmLabel="GPS 기록 허용하기"
          onConfirm={async () => {
            setShowGpsModal(false);
            try {
              await WorkoutNative.requestLocationPermission();
            } catch (_) {}
            await proceedToRunning();
          }}
          cancelLabel="위치 권한 없이 시작하기"
          onCancel={async () => {
            setShowGpsModal(false);
            await proceedToRunning();
          }}
        />
      )}

      {/* 삼성 배터리 최적화 안내 (최초 1회) */}
      {showBatteryGuide && (
        <AlertModal
          icon={MdBatteryAlert}
          iconClass="text-yellow-400"
          title="운동 기록 중단 방지"
          message={
            <div className="space-y-2 text-center">
              <p>
                일부 기기(삼성 등)에서 배터리 절약으로 인해
                <br />
                운동 기록이 중단될 수 있어요.
              </p>
              <p className="text-gray-700 font-semibold">
                배터리 제한 해제를 권장해요 😊
              </p>
              <p className="text-xs text-gray-400 pt-1">
                해제 후 오래 걸어도 걸음 수가 정확하게 기록됩니다.
              </p>
            </div>
          }
          confirmLabel="배터리 제한 해제하기"
          onConfirm={async () => {
            localStorage.setItem("battery_guide_shown", "1");
            await WorkoutNative.requestBatteryOptimizationExclusion();
            setShowBatteryGuide(false);
            setState("running");
          }}
          cancelLabel="괜찮아요, 그냥 시작할게요"
          onCancel={() => {
            localStorage.setItem("battery_guide_shown", "1");
            setShowBatteryGuide(false);
            setState("running");
          }}
        />
      )}

      {/* 신체 활동 권한 안내 */}
      {showPermissionModal && !permissionDenied && (
        <AlertModal
          icon={MdDirectionsWalk}
          iconClass="text-primary"
          title="걸음 수 측정 권한 필요"
          message={
            <span>
              함께걸어요가 걸음 수를 정확히 측정하려면
              <br />
              <strong className="text-gray-700">신체 활동 권한</strong>이
              필요해요.
              <br />이 권한은 운동 중 걸음 수 측정에만 사용됩니다.
            </span>
          }
          confirmLabel="권한 허용하기"
          onConfirm={async () => {
            try {
              const { granted } =
                await WorkoutNative.requestActivityPermission();
              if (granted) {
                setShowPermissionModal(false);
                setState("running");
              } else {
                setPermissionDenied(true);
              }
            } catch {
              setShowPermissionModal(false);
              setState("running");
            }
          }}
          cancelLabel="취소"
          onCancel={() => setShowPermissionModal(false)}
        />
      )}

      {/* 권한 거절 — 예상값 안내 */}
      {showPermissionModal && permissionDenied && (
        <AlertModal
          icon={IoFootsteps}
          iconClass="text-orange-400"
          title="예상값으로 측정됩니다"
          message={
            <div className="space-y-2 text-center">
              <p>
                권한 없이도 운동을 계속할 수 있어요.
                <br />
                걸음 수는 선택한 활동 유형의
                <br />
                평균 보폭으로 자동 계산됩니다.
              </p>
              <p className="text-orange-400 font-semibold text-xs">
                실제 걸음 수와 다소 차이가 있을 수 있어요.
              </p>
            </div>
          }
          confirmLabel="예상값으로 계속하기"
          onConfirm={() => {
            setEstimationMode(true);
            setShowPermissionModal(false);
            setState("running");
          }}
          cancelLabel="취소"
          onCancel={() => setShowPermissionModal(false)}
        />
      )}

      {/* 완료 팝업 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div
              className="flex flex-col items-center py-8 gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              <span className="text-5xl">
                {tooShort ? "😅" : goalProgress >= 100 ? "🎉" : "💪"}
              </span>
              <p className="text-white font-extrabold text-2xl mt-1">
                {tooShort ? "잠깐!" : "운동 완료!"}
              </p>
              <p className="text-white/70 text-sm">
                {tooShort
                  ? "기록이 저장되지 않았어요"
                  : goalProgress >= 100
                    ? "목표 달성! 정말 잘 했어요 🏆"
                    : "오늘도 정말 잘 했어요"}
              </p>
            </div>

            {tooShort ? (
              <div className="px-6 py-10 flex flex-col items-center gap-3">
                <p className="font-extrabold text-gray-800 text-base text-center">
                  너무 짧은 운동이에요 😅
                </p>
                <p className="text-sm text-gray-400 text-center leading-relaxed">
                  30초 이상, 50보 이상 운동해야 기록돼요
                </p>
              </div>
            ) : (
              <>
                {/* 목표 달성 배너 */}
                {goalProgress >= 100 && (
                  <div
                    className="mx-5 mt-4 px-4 py-3 rounded-2xl flex items-center gap-2"
                    style={{ background: "var(--color-primary-light)" }}
                  >
                    <span className="text-lg">🏆</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      목표 달성 완료!
                    </span>
                  </div>
                )}

                {/* 히어로 지표 — 유형별 메인 수치 */}
                <div className="px-5 pt-4">
                  {statLayout.primary === "distance" ? (
                    /* runner / power_walker / hiker — 거리 + 걸음수 2열 */
                    <div
                      className="rounded-2xl p-4 flex items-center"
                      style={{ background: "var(--color-primary-light)" }}
                    >
                      <div className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="font-extrabold text-4xl text-gray-800 leading-none">
                            {effectiveDistance.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-400 font-semibold">
                            km
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400 font-semibold">
                            거리
                          </span>
                          {state === "idle" && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                distanceSource === "gps"
                                  ? "bg-emerald-100 text-emerald-600"
                                  : "bg-white/60 text-gray-400"
                              }`}
                            >
                              {distanceSource === "gps" ? "📍 GPS" : "📍 추정"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-px h-10 bg-gray-200 mx-2 flex-shrink-0" />
                      <div className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="font-extrabold text-4xl text-gray-800 leading-none">
                            {steps.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-400 font-semibold">
                            보
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-semibold">
                          걸음수
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* walker — 걸음수 히어로 */
                    <div
                      className="rounded-2xl p-4 flex flex-col items-center gap-1"
                      style={{ background: "var(--color-primary-light)" }}
                    >
                      <div className="flex items-baseline gap-1">
                        <span className="font-extrabold text-5xl text-gray-800 leading-none">
                          {steps.toLocaleString()}
                        </span>
                        <span className="text-base text-gray-400 font-semibold">
                          보
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">
                        총 걸음수
                      </span>
                    </div>
                  )}
                </div>

                {/* 보조 스탯 그리드 */}
                {(() => {
                  const resultStats =
                    statLayout.primary === "distance"
                      ? [
                          {
                            icon: (
                              <IoSpeedometer className="text-lg text-indigo-500" />
                            ),
                            label: "페이스",
                            value: paceStr,
                            unit: "/km",
                          },
                          {
                            icon: (
                              <IoTime className="text-lg text-violet-500" />
                            ),
                            label: "시간",
                            value: durationLabel,
                            unit: "",
                          },
                          {
                            icon: (
                              <IoFlame className="text-lg text-orange-500" />
                            ),
                            label: "칼로리",
                            value: `${calories}`,
                            unit: "kcal",
                          },
                        ]
                      : [
                          {
                            icon: (
                              <IoLocationSharp className="text-lg text-blue-500" />
                            ),
                            label:
                              distanceSource === "gps"
                                ? "거리 GPS"
                                : "거리 추정",
                            value: effectiveDistance.toFixed(2),
                            unit: "km",
                          },
                          {
                            icon: (
                              <IoTime className="text-lg text-violet-500" />
                            ),
                            label: "시간",
                            value: durationLabel,
                            unit: "",
                          },
                          {
                            icon: (
                              <IoFlame className="text-lg text-orange-500" />
                            ),
                            label: "칼로리",
                            value: `${calories}`,
                            unit: "kcal",
                          },
                        ];
                  return (
                    <div className="px-5 pt-3">
                      <div className="grid grid-cols-3 gap-2">
                        {resultStats.map((s) => (
                          <div
                            key={s.label}
                            className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center gap-1"
                          >
                            {s.icon}
                            <div className="flex items-baseline gap-0.5">
                              <span className="font-extrabold text-gray-800 text-sm leading-none">
                                {s.value}
                              </span>
                              {s.unit && (
                                <span className="text-[10px] text-gray-400 font-semibold">
                                  {s.unit}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* GPS 경로 미리보기 */}
                {savedRoutePoints.length >= 2 && (
                  <div className="px-5 pb-2">
                    <div className="rounded-2xl overflow-hidden relative">
                      <Suspense
                        fallback={
                          <div className="w-full h-[180px] bg-gray-100 rounded-2xl flex items-center justify-center">
                            <span className="text-gray-400 text-sm">
                              🗺️ 지도 로딩 중...
                            </span>
                          </div>
                        }
                      >
                        <RouteMap points={savedRoutePoints} small />
                      </Suspense>
                      <div className="flex items-center gap-3 mt-2 px-1">
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />{" "}
                          출발
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ background: "var(--color-primary)" }}
                          />{" "}
                          도착
                        </span>
                        <span className="ml-auto text-[11px] text-gray-400 font-semibold">
                          {savedRoutePoints.length}개 좌표
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {yesterdayPace && (
                  <div className="px-6 pb-2">
                    <div
                      className="rounded-2xl px-4 py-3 flex items-center gap-3"
                      style={{ background: "var(--color-primary-light)" }}
                    >
                      <IoFootsteps
                        className="text-xl shrink-0"
                        style={{ color: "var(--color-primary)" }}
                      />
                      <div>
                        <p
                          className="text-xs font-bold"
                          style={{ color: "var(--color-primary)" }}
                        >
                          어제의 나와 비교
                        </p>
                        <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                          {yesterdayPace.diff > 0
                            ? `어제보다 ${yesterdayPace.diff.toLocaleString()}보 앞섰어요 🏆`
                            : yesterdayPace.diff < 0
                              ? `어제보다 ${Math.abs(yesterdayPace.diff).toLocaleString()}보 부족했어요 💪`
                              : "어제와 똑같은 페이스예요 👏"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="px-6 pb-2">
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "var(--color-bg, #f9fafb)" }}
                  >
                    <p className="font-extrabold text-gray-800 text-sm mb-3">
                      오늘 추천 식단 🥗
                    </p>
                    <div className="mb-3">
                      <p className="text-[11px] text-gray-400 font-semibold mb-1.5">
                        {elapsedMin >= 30
                          ? "⏱ 30분 이상 운동 — 단백질 보충 필요!"
                          : "⏱ 30분 미만 운동 — 가벼운 식단 추천"}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {durationDiet.meals.map((m) => (
                          <span
                            key={m.name}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white shadow-sm border border-gray-100"
                          >
                            {m.emoji} {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {charDiet && (
                      <div>
                        <p className="text-[11px] text-gray-400 font-semibold mb-1.5">
                          {selectedActivityType!.emoji}{" "}
                          {selectedActivityType!.name} 맞춤 식단
                        </p>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {charDiet.meals.map((m) => (
                            <span
                              key={m.name}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                              }}
                            >
                              {m.emoji} {m.name}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-400 leading-snug">
                          💡 {charDiet.tip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="px-6 py-4">
              {tooShort ? (
                <button
                  onClick={() => {
                    setSteps(0);
                    setElapsed(0);
                    setGpsDistance(0);
                    gpsDistanceRef.current = 0;
                    setDistanceSource("estimated");
                    isSaved.current = false;
                    setTooShort(false);
                    setEstimationMode(false);
                    setShowModal(false);
                    setState("idle");
                    clearWorkoutSession();
                  }}
                  className="w-full py-4 rounded-2xl font-extrabold text-white text-base active:scale-95 transition"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                  }}
                >
                  다시 운동하기
                </button>
              ) : (
                <button
                  onClick={() => {
                    clearWorkoutSession();
                    navigate("/community");
                  }}
                  className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                  }}
                >
                  📝 운동 인증하러가기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 이벤트 보상 해금 팝업 ── */}
      {newlyGranted.length > 0 && (
        <AlertModal
          icon={HiSparkles}
          iconClass="text-amber-400"
          title="아이템 해금! 🎉"
          message={
            <span>
              {newlyGranted.map((g, i) => {
                const label = g.bubbleId
                  ? (BUBBLE_PREVIEWS[g.bubbleId]?.text ?? "말풍선 보상")
                  : (g.titleText ?? "칭호 보상");
                return <span key={i} className="block font-bold text-primary">{label}</span>;
              })}
              <span className="block mt-1">보상이 해금됐어요!</span>
            </span>
          }
          confirmLabel="확인"
          onConfirm={() => setNewlyGranted([])}
          zClass="z-[100]"
        />
      )}
    </div>
  );
}
