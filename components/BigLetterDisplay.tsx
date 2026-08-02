import React from "react";
import type { Prediction } from "../types/asl";

interface BigLetterDisplayProps {
  currentWord: string;
  confirmedLetter: string;
  currentPrediction: Prediction | null;
  sentences: string[];
}

export function BigLetterDisplay({
  currentWord,
  confirmedLetter,
  currentPrediction,
  sentences,
}: BigLetterDisplayProps) {
  const confidence = currentPrediction?.confidence ?? 0;
  const confidencePct = Math.round(confidence * 100);
  const barColor =
    confidence >= 0.8
      ? "bg-brand-green"
      : confidence >= 0.5
      ? "bg-yellow-400"
      : "bg-red-500";

  const lastSentence = sentences[sentences.length - 1];

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none">
      {/* Last completed sentence — top banner, large enough for the other person to read */}
      {lastSentence && (
        <div className="absolute top-16 left-4 right-4 bg-black/75 backdrop-blur-md rounded-2xl border border-brand-border px-5 py-4">
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-1">
            Last sentence
          </p>
          <p className="text-white text-2xl md:text-3xl font-bold leading-tight">
            {lastSentence}
          </p>
        </div>
      )}

      {/* GIANT current letter — the key accessibility element */}
      {/* Positioned center-bottom so other person can clearly read the screen */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center">
        <div className="bg-black/80 backdrop-blur-md border-2 border-brand-green/50 rounded-3xl px-10 py-8 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
            Current letter
          </p>
          <p
            className="font-black text-brand-green leading-none"
            style={{ fontSize: "clamp(5rem, 20vw, 10rem)" }}
          >
            {confirmedLetter || (currentPrediction?.letter ?? "—")}
          </p>
          {currentWord && (
            <p className="text-white text-2xl font-mono tracking-[0.25em] mt-1">
              {currentWord}
              <span className="animate-pulse text-brand-green">_</span>
            </p>
          )}
        </div>
      </div>

      {/* Confidence bar at very bottom */}
      <div className="absolute bottom-20 left-6 right-6">
        <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
          <span>Confidence</span>
          <span>{confidencePct}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ${barColor}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
