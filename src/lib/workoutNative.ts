import { registerPlugin, Capacitor } from "@capacitor/core";

export interface WorkoutStatus {
  isRunning: boolean;
  steps?: number;
  elapsed?: number;
  activityType?: string;
  isPaused?: boolean;
}

export interface WorkoutPlugin {
  isBatteryOptimizationExcluded(): Promise<{ excluded: boolean }>;
  requestBatteryOptimizationExclusion(): Promise<void>;
  checkActivityPermission(): Promise<{ granted: boolean }>;
  requestActivityPermission(): Promise<{ granted: boolean }>;
  startWorkout(options: { activityType: string; nickname: string; characterId: string; theme?: string }): Promise<void>;
  pauseWorkout(): Promise<void>;
  resumeWorkout(): Promise<void>;
  stopWorkout(): Promise<void>;
  getStatus(): Promise<WorkoutStatus>;
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
