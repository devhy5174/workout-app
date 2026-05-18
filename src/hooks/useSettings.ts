import { useEffect, useState } from "react";

export type Language = "ko" | "en";

export type NotificationKey =
  | "workoutNotification"
  | "workoutReminderNotification"
  | "streakNotification"
  | "partyNotification"
  | "partyStartNotification"
  | "partyAnnouncementNotification";

type SettingsState = {
  workoutNotification: boolean;
  workoutReminderNotification: boolean;
  streakNotification: boolean;
  partyNotification: boolean;
  partyStartNotification: boolean;
  partyAnnouncementNotification: boolean;
  language: Language;
};

const STORAGE_KEY = "app_settings";

const defaults: SettingsState = {
  workoutNotification: true,
  workoutReminderNotification: true,
  streakNotification: true,
  partyNotification: true,
  partyStartNotification: true,
  partyAnnouncementNotification: true,
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
