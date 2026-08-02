// Shared TypeScript interfaces for the ASL-CV app

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface Prediction {
  letter: string;
  confidence: number;
}

export type PipelineStage =
  | "idle"
  | "loading_model"
  | "loading_mediapipe"
  | "starting_camera"
  | "running"
  | "error";
