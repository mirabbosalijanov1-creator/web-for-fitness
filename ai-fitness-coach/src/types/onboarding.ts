export type Gender = "male" | "female" | "non-binary" | "prefer_not_to_say";

export interface StrengthNumbers {
  bench?: number;
  squat?: number;
  deadlift?: number;
  press?: number;
}

export interface LifestyleInputs {
  sleepHours?: number;
  stressLevel?: "low" | "moderate" | "high";
  stepsPerDay?: number;
}

export interface TrainingLogistics {
  daysPerWeek: number;
  sessionLength: number;
  environment: "gym" | "home";
  equipment: string[];
}

export interface GoalInputs {
  shortTerm: string;
  longTerm: string;
  targetPhysique?: string;
}

export interface AvatarMetrics {
  shoulder: "small" | "medium" | "wide";
  waist: "tight" | "average" | "blocky";
  muscle: "lean" | "athletic" | "massive";
}

export interface OnboardingData {
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  bodyPhoto?: string;
  shoulderWidth?: AvatarMetrics["shoulder"];
  wristSize?: "small" | "medium" | "large";
  injuries?: string;
  bodyType?: "ecto" | "meso" | "endo";
  goals: GoalInputs;
  logistics: TrainingLogistics;
  strength?: StrengthNumbers;
  lifestyle?: LifestyleInputs;
  avatar?: AvatarMetrics;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  cues?: string;
}

export interface WorkoutDay {
  name: string;
  focus?: string;
  exercises: WorkoutExercise[];
}

export interface WeeklyPlan {
  days: WorkoutDay[];
}
