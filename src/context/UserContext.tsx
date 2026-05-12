import {
  createContext,
  useContext,
  useEffect,
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
  addUserPoints,
} from "../lib/workoutService";

export type { WorkoutRecord, UserGoal };

export type AppUser = {
  id: string;
  nickname: string | null;
  character_id: number | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  points: number | null;
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
});

async function fetchProfile(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as AppUser;
}

async function loadUserData(userId: string) {
  const [profile, workouts, goal] = await Promise.all([
    fetchProfile(userId),
    fetchWorkoutHistory(userId),
    fetchActiveGoal(userId),
  ]);
  return { profile, workouts, goal };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [userGoal, setUserGoalState] = useState<UserGoal | null>(null);
  const [workoutRecords, setWorkoutRecords] = useState<WorkoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { profile, workouts, goal } = await loadUserData(session.user.id);
        setUserProfile(profile);
        setWorkoutRecords(workouts);
        setUserGoalState(goal);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { profile, workouts, goal } = await loadUserData(session.user.id);
          setUserProfile(profile);
          setWorkoutRecords(workouts);
          setUserGoalState(goal);
        } else {
          setUserProfile(null);
          setWorkoutRecords([]);
          setUserGoalState(null);
        }
      }
    );

    return () => subscription.unsubscribe();
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
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : prev));
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

    const pointsResult = await addUserPoints(user.id, record.points_earned);
    if (pointsResult.error) {
      console.error("포인트 업데이트 실패:", pointsResult.error);
    } else {
      setUserProfile((prev) =>
        prev ? { ...prev, points: (prev.points ?? 0) + record.points_earned } : prev
      );
    }

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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
