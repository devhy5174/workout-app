import { useEffect, useState } from "react";

export type Language = "ko" | "en";

type SettingsState = {
  workoutNotification: boolean;
  dietNotification: boolean;
  language: Language;
};

const STORAGE_KEY = "app_settings";

const defaults: SettingsState = {
  workoutNotification: true,
  dietNotification: true,
  language: "ko",
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function toggleNotification(
    key: "workoutNotification" | "dietNotification",
  ) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setLanguage(lang: Language) {
    setSettings((prev) => ({ ...prev, language: lang }));
  }

  return { settings, toggleNotification, setLanguage };
}
