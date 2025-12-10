import type { WeeklyPlan, WorkoutLogPayload } from "./onboarding";

export interface WorkoutPlanRow {
  plan_json: WeeklyPlan;
}

export interface WorkoutPlanRecord extends WorkoutPlanRow {
  id: string;
  created_at?: string;
}

export interface WorkoutLogRow {
  log_json: WorkoutLogPayload;
}
