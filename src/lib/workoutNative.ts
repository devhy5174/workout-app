import { registerPlugin, Capacitor } from "@capacitor/core";

export interface WorkoutPlugin {
  startWorkout(options: { activityType: string; nickname: string; characterId: string }): Promise<void>;
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

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export default WorkoutNative;
