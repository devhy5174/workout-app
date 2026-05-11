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
  deleteActiveGoal,
  fetchActiveGoal,
  fetchWorkoutHistory,
  saveUserGoal,
  saveWorkoutRecord,
  type UserGoal,
  type WorkoutRecord,
} from "../lib/workoutService";

export type AppUser = {
  id: string;
  nickname: string | null;
  gender: string | null;
  age: number | null;
  character_id: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  created_at: string;
};

type UserContextValue = {
  user: User | null;
  userProfile: AppUser | null;
  isLoading: boolean;
  userGoal: UserGoal | null;
  workoutRecords: WorkoutRecord[];
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<AppUser, "id" | "created_at">>) => Promise<{ error: string | null }>;
  saveGoal: (type: UserGoal["goal_type"], value: number) => Promise<{ error: string | null }>;
  deleteGoal: () => Promise<{ error: string | null }>;
  saveWorkout: (record: Omit<WorkoutRecord, "id" | "user_id" | "created_at">) => Promise<{ error: string | null }>;
  refreshWorkoutHistory: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  userProfile: null,
  isLoading: true,
  userGoal: null,
  workoutRecords: [],
  login: async () => ({ error: null }),
  logout: async () => {},
  updateProfile: async () => ({ error: null }),
  saveGoal: async () => ({ error: null }),
  deleteGoal: async () => ({ error: null }),
  saveWorkout: async () => ({ error: null }),
  refreshWorkoutHistory: async () => {},
});

async function fetchProfile(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", userId)
    .single();

    console.log("[fetchProfile]", { data, error });
  if (error) return null;
  return data as AppUser;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userGoal, setUserGoal] = useState<UserGoal | null>(null);
  const [workoutRecords, setWorkoutRecords] = useState<WorkoutRecord[]>([]);

  async function loadUserData(userId: string) {
    const [profile, goal, records] = await Promise.all([
      fetchProfile(userId),
      fetchActiveGoal(userId),
      fetchWorkoutHistory(userId),
    ]);
    setUserProfile(profile);
    setUserGoal(goal);
    setWorkoutRecords(records);
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('🔥 Auth event:', _event);
          console.log('🔥 Session:', session);
          await loadUserData(session.user.id);
        } else {
          setUserProfile(null);
          setUserGoal(null);
          setWorkoutRecords([]);
        }
        setIsLoading(false);
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
    const { data, error } = await supabase
      .from("app_users")
    .upsert({

  id: user.id,

  ...updates,

})
      .select()
      .single();
    console.log("[updateProfile] updates:", updates);
    console.log("[updateProfile] result:", { data, error: error?.message });
    if (!error) {
      const fresh = await fetchProfile(user.id);
      console.log("[updateProfile] fetched profile:", fresh);
      setUserProfile(fresh);
    }
    return { error: error?.message ?? null };
  };

  const saveGoal = async (type: UserGoal["goal_type"], value: number) => {
    if (!user) return { error: "로그인이 필요합니다." };
    const result = await saveUserGoal({ goal_type: type, goal_value: value }, user.id);
    if (!result.error) {
      const updated = await fetchActiveGoal(user.id);
      setUserGoal(updated);
    }
    return result;
  };

  const deleteGoal = async () => {
    if (!user) return { error: "로그인이 필요합니다." };
    const result = await deleteActiveGoal(user.id);
    if (!result.error) setUserGoal(null);
    return result;
  };

  const saveWorkout = async (
    record: Omit<WorkoutRecord, "id" | "user_id" | "created_at">
  ) => {
    if (!user) return { error: "로그인이 필요합니다." };
    const result = await saveWorkoutRecord(record, user.id);
    if (!result.error) {
      const records = await fetchWorkoutHistory(user.id);
      setWorkoutRecords(records);
    }
    return result;
  };

  const refreshWorkoutHistory = async () => {
    if (!user) return;
    const records = await fetchWorkoutHistory(user.id);
    setWorkoutRecords(records);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        userGoal,
        workoutRecords,
        login,
        logout,
        updateProfile,
        saveGoal,
        deleteGoal,
        saveWorkout,
        refreshWorkoutHistory,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
