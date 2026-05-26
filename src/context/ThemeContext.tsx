import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Theme = "energy" | "nature" | "cosmo" | "mono";

const VALID_THEMES: Theme[] = ["energy", "nature", "cosmo", "mono"];
const isValidTheme = (t: string): t is Theme => VALID_THEMES.includes(t as Theme);

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "energy", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("energy");

  async function loadThemeForUser(userId: string) {
    const { data } = await supabase
      .from("app_users")
      .select("theme")
      .eq("id", userId)
      .single();
    if (data?.theme && isValidTheme(data.theme)) {
      setThemeState(data.theme);
    }
  }

  // 앱 시작 시 세션 확인 → app_users.theme 불러와 적용
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadThemeForUser(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        loadThemeForUser(session.user.id);
      }
      if (event === "SIGNED_OUT") {
        setThemeState("energy");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await supabase
        .from("app_users")
        .update({ theme: t })
        .eq("id", session.user.id);
    })();
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
