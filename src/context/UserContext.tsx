import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  type WorkoutRecord,
  type UserGoal,
  fetchWorkoutHistory,
  fetchActiveGoal,
  saveWorkoutRecord,
  saveUserGoal,
  deleteActiveGoal,
} from "../lib/workoutService";

export type { WorkoutRecord, UserGoal };

export type AppUser = {
  id: string;
  nickname: string | null;
  activity_type_id: number | null;
  character_id: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  points: number | null;
  theme: string | null;
  created_at: string;
};

type UserContextValue = {
  user: User | null;
  userProfile: AppUser | null;
  userGoal: UserGoal | null;
  workoutRecords: WorkoutRecord[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<AppUser, "id" | "created_at">>) => Promise<{ error: string | null }>;
  saveWorkout: (record: Omit<WorkoutRecord, "id" | "user_id" | "created_at">) => Promise<{ error: string | null }>;
  saveGoal: (type: UserGoal["goal_type"], value: number) => Promise<{ error: string | null }>;
  deleteGoal: () => Promise<{ error: string | null }>;
  refreshWorkoutHistory: () => Promise<void>;
  addLocalPoints: (amount: number) => void;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  userProfile: null,
  userGoal: null,
  workoutRecords: [],
  isLoading: true,
  login: async () => ({ error: null }),
  logout: async () => {},
  updateProfile: async () => ({ error: null }),
  saveWorkout: async () => ({ error: null }),
  saveGoal: async () => ({ error: null }),
  deleteGoal: async () => ({ error: null }),
  refreshWorkoutHistory: async () => {},
  addLocalPoints: () => {},
});

async function fetchProfile(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", userId)
    .single();

    console.log("fetchProfile 결과", { data, error });
  if (error) return null;
  return data as AppUser;
}

async function loadUserData(userId: string) {
  console.log("1. loadUserData 시작");
  const profile = await fetchProfile(userId);
  console.log("2. fetchProfile 완료", profile);
  const workouts = await fetchWorkoutHistory(userId);
  console.log("3. fetchWorkoutHistory 완료", workouts);
  const goal = await fetchActiveGoal(userId);
  console.log("4. fetchActiveGoal 완료", goal);
  return { profile, workouts, goal };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [userGoal, setUserGoalState] = useState<UserGoal | null>(null);
  const [workoutRecords, setWorkoutRecords] = useState<WorkoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ref로 stale closure 없이 현재 profile 여부 확인
  const userRef = useRef<User | null>(null);
  const userProfileRef = useRef<AppUser | null>(null);

// 앱 시작 시 세션 복구 + 유저 데이터 로드
useEffect(() => {
  // 언마운트 이후 state 업데이트 방지용
  let mounted = true;

  // 초기 세션 확인 함수
  async function initSession() {
    console.log("0. 초기 세션 확인");

    // localStorage에 저장된 세션 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 이미 컴포넌트 종료됐으면 중단
    if (!mounted) return;

    // 현재 로그인 유저 저장
    const currentUser = session?.user ?? null;
    setUser(currentUser);

    // 로그인 안된 상태면 로딩 종료
    if (!currentUser) {
      console.log("유저 없음");
      setIsLoading(false);
      return;
    }

    console.log("1. loadUserData 시작");

    // 유저 데이터 불러오는 동안 로딩 표시
    setIsLoading(true);

    try {
      // 프로필 / 운동기록 / 목표 불러오기
      const { profile, workouts, goal } = await loadUserData(
        currentUser.id
      );

      // 언마운트됐으면 중단
      if (!mounted) return;

      // 상태 저장
      setUserProfile(profile);
      setWorkoutRecords(workouts);
      setUserGoalState(goal);
    } catch (e) {
      console.error("loadUserData 에러", e);
    } finally {
      // 항상 로딩 종료
      if (mounted) {
        console.log("5. isLoading false 설정");
        setIsLoading(false);
      }
    }
  }

  // 앱 시작 시 1회 실행
  initSession();

  // 로그인 / 로그아웃 상태 변화 감지
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth event:", event);

    // 로그아웃 시 상태 초기화
    if (event === "SIGNED_OUT") {
      setUser(null);
      setUserProfile(null);
      setWorkoutRecords([]);
      setUserGoalState(null);
      setIsLoading(false);
      return;
    }

    // 로그인 성공 시 user만 갱신
    // 실제 데이터 fetch는 initSession에서만 처리
    if (event === "SIGNED_IN") {
      setUser(session?.user ?? null);
      
       // 로그인 직후 유저 데이터 다시 불러오기
  initSession();
    }
  });

  // cleanup
  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  // 다른 탭 갔다 오면: 프로필 없을 때만 재로드
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (!userRef.current || userProfileRef.current) return;

      loadUserData(userRef.current.id).then(({ profile, workouts, goal }) => {
        userProfileRef.current = profile;
        setUserProfile(profile);
        setWorkoutRecords(workouts);
        setUserGoalState(goal);
      });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (
    updates: Partial<Omit<AppUser, "id" | "created_at">>
  ) => {
    if (!user) return { error: "로그인이 필요합니다." };

    const { error } = await supabase
      .from("app_users")
      .update(updates)
      .eq("id", user.id);

    if (!error) {
      setUserProfile((prev) => {
        const next = prev ? { ...prev, ...updates } : prev;
        userProfileRef.current = next;
        return next;
      });
    }

    return { error: error?.message ?? null };
  };
  const saveWorkout = async (
    record: Omit<WorkoutRecord, "id" | "user_id" | "created_at">
  ) => {
    console.log("💾 saveWorkout user:", user); 
    if (!user) return { error: "로그인이 필요합니다." };

    const { data: savedRecord, error } = await saveWorkoutRecord(record, user.id);
    if (error) {
      console.error("운동 기록 저장 실패:", error);
      return { error };
    }

    const newRecord: WorkoutRecord = savedRecord ?? { ...record, user_id: user.id };
    setWorkoutRecords((prev) => [newRecord, ...prev]);

    // 로컬 포인트 상태 낙관적 업데이트 (Supabase 실제 업데이트는 pointService.addPoints가 담당)
    setUserProfile((prev) => {
      const next = prev ? { ...prev, points: (prev.points ?? 0) + record.points_earned } : prev;
      userProfileRef.current = next;
      return next;
    });

    return { error: null };
  };

  const saveGoal = async (type: UserGoal["goal_type"], value: number) => {
    if (!user) return { error: "로그인이 필요합니다." };

    const result = await saveUserGoal({ goal_type: type, goal_value: value }, user.id);
    if (!result.error) {
      const newGoal: UserGoal = {
        goal_type: type,
        goal_value: value,
        is_active: true,
        user_id: user.id,
      };
      setUserGoalState(newGoal);
    }
    return result;
  };

  const deleteGoal = async () => {
    if (!user) return { error: "로그인이 필요합니다." };

    const result = await deleteActiveGoal(user.id);
    if (!result.error) {
      setUserGoalState(null);
    }
    return result;
  };

  const refreshWorkoutHistory = async () => {
    if (!user) return;
    const workouts = await fetchWorkoutHistory(user.id);
    setWorkoutRecords(workouts);
  };

  const addLocalPoints = (amount: number) => {
    setUserProfile((prev) => {
      const next = prev ? { ...prev, points: (prev.points ?? 0) + amount } : prev;
      userProfileRef.current = next;
      return next;
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userProfile,
        userGoal,
        workoutRecords,
        isLoading,
        login,
        logout,
        updateProfile,
        saveWorkout,
        saveGoal,
        deleteGoal,
        refreshWorkoutHistory,
        addLocalPoints,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
