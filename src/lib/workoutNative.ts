import { registerPlugin } from "@capacitor/core";

export interface WorkoutPlugin {
  startWorkout(options: { activityType: string; nickname: string }): Promise<void>;
  pauseWorkout(): Promise<void>;
  resumeWorkout(): Promise<void>;
  stopWorkout(): Promise<void>;
  addListener(
    eventName: "workoutUpdate",
    callback: (data: WorkoutUpdate) => void,
  ): Promise<{ remove: () => void }>;
}

export interface WorkoutUpdate {
  steps: number;
  elapsed: number;
  distance: number;
  calories: number;
}

const WorkoutNative = registerPlugin<WorkoutPlugin>("Workout");

// Android 네이티브 앱인지 확인
export function isNative(): boolean {
  return typeof (window as unknown as { Capacitor?: { isNative?: boolean } })
    .Capacitor?.isNative === "boolean"
    ? (window as unknown as { Capacitor?: { isNative?: boolean } }).Capacitor!
        .isNative!
    : false;
}

export default WorkoutNative;
