import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type AppUser = {
  id: string;
  nickname: string | null;
  character_id: number | null;
  created_at: string;
};

type UserContextValue = {
  user: User | null;
  userProfile: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<AppUser, "id" | "created_at">>) => Promise<{ error: string | null }>;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  userProfile: null,
  isLoading: true,
  login: async () => ({ error: null }),
  logout: async () => {},
  updateProfile: async () => ({ error: null }),
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

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setUserProfile);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).then(setUserProfile);
        } else {
          setUserProfile(null);
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

  return (
    <UserContext.Provider value={{ user, userProfile, isLoading, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);