"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";

const CONFIDENCE_THRESHOLD = 0.8;
const CONSECUTIVE_FRAMES_REQUIRED = 10;
const MEDIAPIPE_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/hands";

export interface Prediction {
  letter: string;
  confidence: number;
}

export interface AslRecognizerResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  confirmedLetter: string;
  currentPrediction: Prediction | null;
  isLoading: boolean;
  loadingStage: string;
  error: string | null;
}

export function useAslRecognizer(): AslRecognizerResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const gestureEstimatorRef = useRef<any>(null);
  const frameBufferRef = useRef<string[]>([]);
  const lastConfirmedRef = useRef<string>("");

  const [confirmedLetter, setConfirmedLetter] = useState("");
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);

  const pushToBuffer = useCallback((letter: string, confidence: number) => {
    const buf = frameBufferRef.current;
    buf.push(letter);
    if (buf.length > CONSECUTIVE_FRAMES_REQUIRED) buf.shift();
    if (
      buf.length === CONSECUTIVE_FRAMES_REQUIRED &&
      confidence >= CONFIDENCE_THRESHOLD &&
      buf.every((l) => l === letter)
    ) {
      frameBufferRef.current = [];
      if (letter !== lastConfirmedRef.current) {
        lastConfirmedRef.current = letter;
        setConfirmedLetter(letter);
      }
    }
  }, []);

  const runFingerpose = useCallback((landmarks: any[]) => {
    const ge = gestureEstimatorRef.current;
    if (!ge) return;
    try {
      // fingerpose expects landmarks as array of [x, y, z] arrays
      const lmArray = landmarks.map((lm: any) => [lm.x * 1000, lm.y * 1000, lm.z * 1000]);
      const result = ge.estimate(lmArray, 8.5);
      if (result.gestures && result.gestures.length > 0) {
        const best = result.gestures.reduce((a: any, b: any) =>
          a.score > b.score ? a : b
        );
        const confidence = Math.min(best.score / 10, 1.0);
        setCurrentPrediction({ letter: best.name, confidence });
        pushToBuffer(best.name, confidence);
      } else {
        setCurrentPrediction(null);
        frameBufferRef.current = [];
        lastConfirmedRef.current = "";
      }
    } catch (_) {
      // silent fail on estimation errors
    }
  }, [pushToBuffer]);

  const onHandsResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.multiHandLandmarks?.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      runFingerpose(landmarks);

      // Draw skeleton overlay
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      const CONNECTIONS = [
        [0,1],[1,2],[2,3],[3,4],
        [0,5],[5,6],[6,7],[7,8],
        [0,9],[9,10],[10,11],[11,12],
        [0,13],[13,14],[14,15],[15,16],
        [0,17],[17,18],[18,19],[19,20],
        [5,9],[9,13],[13,17]
      ];
      ctx.strokeStyle = "rgba(0,255,170,0.5)";
      ctx.lineWidth = 2;
      CONNECTIONS.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
        ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
        ctx.stroke();
      });
      landmarks.forEach((lm: any, i: number) => {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, i === 0 ? 6 : 3, 0, 2 * Math.PI);
        ctx.fillStyle = i === 0 ? "#ffffff" : "#00FFAA";
        ctx.fill();
      });
      ctx.restore();
    } else {
      frameBufferRef.current = [];
      lastConfirmedRef.current = "";
      setCurrentPrediction(null);
    }
  }, [runFingerpose]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoadingStage("Setting up WebGL...");
        await tf.setBackend("webgl");
        await tf.ready();

        // Load fingerpose gesture estimator (no model download needed)
        setLoadingStage("Loading gesture definitions...");
        const fp = await import("fingerpose");
        const { ASL_GESTURES } = await import("../lib/aslGestures");
        const ge = new fp.GestureEstimator(ASL_GESTURES);
        gestureEstimatorRef.current = ge;

        setLoadingStage("Starting MediaPipe Hands...");
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
          setError(err?.message ?? "Initialization failed");
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      cameraRef.current?.stop();
      handsRef.current?.close();
    };
  }, [onHandsResults]);

  return { videoRef, canvasRef, confirmedLetter, currentPrediction, isLoading, loadingStage, error };
}
