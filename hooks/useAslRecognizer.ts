"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

// ─── Constants ──────────────────────────────────────────────────────────────

// ASL alphabet + special tokens. Order MUST match your model's output class order.
export const ASL_LABELS: string[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z",
  "del", "nothing", "space",
];

const MODEL_PATH = "/model/model.json";
const CONFIDENCE_THRESHOLD = 0.8;
const CONSECUTIVE_FRAMES_REQUIRED = 10;
const MEDIAPIPE_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/hands";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Prediction {
  letter: string;
  confidence: number;
}

export interface AslRecognizerResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Debounced, confirmed ASL letter (10 consecutive confident frames) */
  confirmedLetter: string;
  /** Raw live prediction every frame — use for live confidence display */
  currentPrediction: Prediction | null;
  /** Accumulated word buffer (space = word break, del = backspace) */
  wordBuffer: string;
  isLoading: boolean;
  loadingStage: string;
  error: string | null;
  /** Call to manually clear the word buffer */
  clearWord: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAslRecognizer(): AslRecognizerResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<tf.LayersModel | null>(null);
  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  // Rolling buffer of last N predicted letters (no React state — avoids 30 re-renders/sec)
  const frameBufferRef = useRef<string[]>([]);
  // Track last confirmed letter to prevent re-confirming the same letter on hold
  const lastConfirmedRef = useRef<string>("");

  const [confirmedLetter, setConfirmedLetter] = useState<string>("");
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);
  const [wordBuffer, setWordBuffer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);

  const clearWord = useCallback(() => {
    setWordBuffer("");
    lastConfirmedRef.current = "";
  }, []);

  // ─── Word Buffer Logic ─────────────────────────────────────────────────────
  // Called when a letter is confirmed. Handles space, del, and regular letters.
  const handleConfirmedLetter = useCallback((letter: string) => {
    // Prevent re-firing same letter unless hand reset (buffer cleared)
    if (letter === lastConfirmedRef.current) return;
    lastConfirmedRef.current = letter;
    setConfirmedLetter(letter);

    setWordBuffer((prev) => {
      if (letter === "nothing") return prev;
      if (letter === "space") return prev + " ";
      if (letter === "del") return prev.slice(0, -1);
      return prev + letter;
    });
  }, []);

  // ─── Frame Buffer / Debounce ───────────────────────────────────────────────
  const pushToBuffer = useCallback(
    (letter: string, confidence: number) => {
      const buf = frameBufferRef.current;
      buf.push(letter);
      if (buf.length > CONSECUTIVE_FRAMES_REQUIRED) buf.shift();

      if (
        buf.length === CONSECUTIVE_FRAMES_REQUIRED &&
        confidence >= CONFIDENCE_THRESHOLD &&
        buf.every((l) => l === letter)
      ) {
        frameBufferRef.current = []; // reset buffer after confirmation
        handleConfirmedLetter(letter);
      }
    },
    [handleConfirmedLetter]
  );

  // ─── TFJS Inference ────────────────────────────────────────────────────────
  const runInference = useCallback(
    (landmarks: { x: number; y: number; z: number }[]) => {
      if (!modelRef.current) return;

      tf.tidy(() => {
        // Flatten 21 landmarks × 3 (x,y,z) → shape [1, 63]
        const flat = landmarks.flatMap((lm) => [lm.x, lm.y, lm.z]);
        const inputTensor = tf.tensor2d([flat], [1, 63]);
        const outputTensor = modelRef.current!.predict(inputTensor) as tf.Tensor;
        const probabilities = outputTensor.dataSync() as Float32Array;

        // Manual argmax (faster than tf.argMax for small output vectors)
        let maxIdx = 0;
        let maxVal = probabilities[0];
        for (let i = 1; i < probabilities.length; i++) {
          if (probabilities[i] > maxVal) {
            maxVal = probabilities[i];
            maxIdx = i;
          }
        }

        const letter = ASL_LABELS[maxIdx] ?? "?";
        setCurrentPrediction({ letter, confidence: maxVal });
        pushToBuffer(letter, maxVal);
      });
    },
    [pushToBuffer]
  );

  // ─── MediaPipe onResults ──────────────────────────────────────────────────
  const onHandsResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mirror horizontally so it feels like a selfie camera
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (results.multiHandLandmarks?.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        runInference(landmarks);

        // Draw landmark skeleton overlay
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        landmarks.forEach((lm: { x: number; y: number }, idx: number) => {
          const cx = lm.x * canvas.width;
          const cy = lm.y * canvas.height;
          ctx.beginPath();
          ctx.arc(cx, cy, idx === 0 ? 6 : 4, 0, 2 * Math.PI);
          ctx.fillStyle = idx === 0 ? "#FFFFFF" : "#00FFAA";
          ctx.fill();
        });
        ctx.restore();
      } else {
        // Hand lost — reset buffer and live prediction
        frameBufferRef.current = [];
        lastConfirmedRef.current = "";
        setCurrentPrediction(null);
      }
    },
    [runInference]
  );

  // ─── Initialization ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Stage 1: Setup TF backend
        setLoadingStage("Setting up WebGL backend...");
        await tf.setBackend("webgl");
        await tf.ready();

        // Stage 2: Load model
        setLoadingStage("Loading ASL model weights...");
        const model = await tf.loadLayersModel(MODEL_PATH);

        // Warm up: eliminates shader compilation on first real inference
        const dummy = tf.zeros([1, 63]);
        (model.predict(dummy) as tf.Tensor).dispose();
        dummy.dispose();
        modelRef.current = model;

        if (cancelled) return;

        // Stage 3: MediaPipe (dynamic import = SSR-safe in Next.js)
        setLoadingStage("Initializing MediaPipe Hands...");
        const { Hands } = await import("@mediapipe/hands");
        const { Camera } = await import("@mediapipe/camera_utils");

        const hands = new Hands({
          locateFile: (file: string) => `${MEDIAPIPE_CDN}/${file}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6,
        });
        hands.onResults(onHandsResults);
        handsRef.current = hands;

        if (!videoRef.current) throw new Error("Video element not found");

        // Stage 4: Camera
        setLoadingStage("Starting camera...");
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) await hands.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });
        await camera.start();
        cameraRef.current = camera;

        if (!cancelled) setIsLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Unknown initialization error");
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      cameraRef.current?.stop();
      handsRef.current?.close();
      modelRef.current?.dispose();
    };
  }, [onHandsResults]);

  return {
    videoRef,
    canvasRef,
    confirmedLetter,
    currentPrediction,
    wordBuffer,
    isLoading,
    loadingStage,
    error,
    clearWord,
  };
}
