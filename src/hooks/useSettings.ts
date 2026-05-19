import { useEffect, useState } from "react";

export type Language = "ko" | "en";

export type NotificationKey =
  | "workoutNotification"
  | "workoutReminderNotification"
  | "streakNotification"
  | "partyNotification"
  | "partyActivityNotification"
  | "dietNotification"
  | "dietBurnNotification"
  | "dietRewardNotification";

type SettingsState = {
  workoutNotification: boolean;
  workoutReminderNotification: boolean;
  streakNotification: boolean;
  partyNotification: boolean;
  partyActivityNotification: boolean;
  dietNotification: boolean;
  dietBurnNotification: boolean;
  dietRewardNotification: boolean;
  language: Language;
};

const STORAGE_KEY = "app_settings";

const defaults: SettingsState = {
  workoutNotification: true,
  workoutReminderNotification: true,
  streakNotification: true,
  partyNotification: true,
  partyActivityNotification: true,
  dietNotification: true,
  dietBurnNotification: true,
  dietRewardNotification: true,
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

  function toggleNotification(key: NotificationKey) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setLanguage(lang: Language) {
    setSettings((prev) => ({ ...prev, language: lang }));
  }

  return { settings, toggleNotification, setLanguage };
}
