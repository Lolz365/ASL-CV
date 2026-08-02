import { useEffect, useRef, useState, useCallback } from 'react';
import type { RefObject } from 'react';

const CONFIDENCE_THRESHOLD = 0.8;
const CONSECUTIVE_FRAMES_REQUIRED = 10;
const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands';

export interface Prediction {
  letter: string;
  confidence: number;
}

export interface AslRecognizerResult {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  confirmedLetter: string;
  currentPrediction: Prediction | null;
  isLoading: boolean;
  loadingStage: string;
  error: string | null;
}

export function useAslRecognizer(): AslRecognizerResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<unknown>(null);
  const handsRef = useRef<unknown>(null);
  const gestureEstimatorRef = useRef<unknown>(null);
  const frameBufferRef = useRef<string[]>([]);
  const lastConfirmedRef = useRef<string>('');

  const [confirmedLetter, setConfirmedLetter] = useState('');
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('Initializing...');
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

  const runFingerpose = useCallback((landmarks: Array<{ x: number; y: number; z: number }>) => {
    const ge = gestureEstimatorRef.current as {
      estimate: (lm: number[][], score: number) => { gestures: Array<{ name: string; score: number }> };
    } | null;
    if (!ge) return;
    try {
      // fingerpose expects [[x, y, z], ...] scaled to pixel-like coords
      const lmArray = landmarks.map((lm) => [
        lm.x * 640,
        lm.y * 480,
        (lm.z ?? 0) * 640,
      ]);
      const result = ge.estimate(lmArray, 8.5);
      if (result.gestures.length > 0) {
        const best = result.gestures.reduce((a, b) => (a.score > b.score ? a : b));
        const confidence = Math.min(best.score / 10, 1.0);
        setCurrentPrediction({ letter: best.name, confidence });
        pushToBuffer(best.name, confidence);
      } else {
        setCurrentPrediction(null);
        frameBufferRef.current = [];
        lastConfirmedRef.current = '';
      }
    } catch (_) {
      // silent
    }
  }, [pushToBuffer]);

  const onHandsResults = useCallback((results: {
    image: CanvasImageSource;
    multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
  }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      runFingerpose(landmarks);

      // Draw skeleton
      const CONNECTIONS: [number, number][] = [
        [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
        [0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],
        [0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17],
      ];
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.strokeStyle = 'rgba(0,255,170,0.5)';
      ctx.lineWidth = 2;
      CONNECTIONS.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
        ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
        ctx.stroke();
      });
      landmarks.forEach((lm, i) => {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, i === 0 ? 6 : 3, 0, 2 * Math.PI);
        ctx.fillStyle = i === 0 ? '#ffffff' : '#00FFAA';
        ctx.fill();
      });
      ctx.restore();
    } else {
      frameBufferRef.current = [];
      lastConfirmedRef.current = '';
      setCurrentPrediction(null);
    }
  }, [runFingerpose]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoadingStage('Loading gesture engine...');
        const fp = await import('fingerpose');
        const { ASL_GESTURES } = await import('../lib/aslGestures');
        gestureEstimatorRef.current = new fp.GestureEstimator(ASL_GESTURES);

        setLoadingStage('Starting MediaPipe Hands...');
        const { Hands } = await import('@mediapipe/hands');
        const { Camera } = await import('@mediapipe/camera_utils');

        const hands = new Hands({
          locateFile: (file: string) => `${MEDIAPIPE_CDN}/${file}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6,
        });
        hands.onResults(onHandsResults as (results: unknown) => void);
        handsRef.current = hands;

        if (!videoRef.current) throw new Error('Video element not found');

        setLoadingStage('Starting camera...');
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            const h = handsRef.current as { send: (o: { image: HTMLVideoElement }) => Promise<void> } | null;
            if (videoRef.current && h) await h.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });
        await camera.start();
        cameraRef.current = camera;

        if (!cancelled) setIsLoading(false);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Initialization failed');
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      (cameraRef.current as { stop?: () => void } | null)?.stop?.();
      (handsRef.current as { close?: () => void } | null)?.close?.();
    };
  }, [onHandsResults]);

  return { videoRef, canvasRef, confirmedLetter, currentPrediction, isLoading, loadingStage, error };
}
