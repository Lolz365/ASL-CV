import React from "react";
import type { Prediction } from "../types/asl";

interface TranslationBannerProps {
  confirmedLetter: string;
  currentPrediction: Prediction | null;
  wordBuffer: string;
  onClearWord: () => void;
  ttsEnabled: boolean;
}

export function TranslationBanner({
  confirmedLetter,
  currentPrediction,
  wordBuffer,
  onClearWord,
  ttsEnabled,
}: TranslationBannerProps) {
  const confidence = currentPrediction?.confidence ?? 0;
  const confidencePct = Math.round(confidence * 100);
  const barColor =
    confidence >= 0.8
      ? "bg-brand-green"
      : confidence >= 0.5
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col gap-3 pointer-events-none">
      {/* Word Buffer */}
      {wordBuffer && (
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex-1 bg-black/60 backdrop-blur-md border border-brand-border rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1 font-mono uppercase tracking-widest">
              Word Buffer
            </p>
            <p className="text-white text-2xl font-mono tracking-[0.2em] truncate">
              {wordBuffer}
              <span className="animate-pulse ml-1 text-brand-green">|</span>
            </p>
          </div>
          <button
            onClick={onClearWord}
            className="shrink-0 bg-black/60 backdrop-blur-md border border-brand-border rounded-xl px-4 py-3 text-gray-400 hover:text-white hover:border-brand-green transition-colors text-sm font-mono"
          >
            Clear
          </button>
        </div>
      )}

      {/* Main prediction row */}
      <div className="flex items-end gap-4">
        {/* Big letter display */}
        <div className="bg-black/70 backdrop-blur-md border border-brand-border rounded-2xl px-6 py-4 min-w-[100px] text-center">
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-1">
            Live
          </p>
          <p className="text-5xl font-bold text-brand-green font-mono leading-none">
            {currentPrediction?.letter ?? "—"}
          </p>
        </div>

        {/* Confirmed + confidence */}
        <div className="flex-1 bg-black/70 backdrop-blur-md border border-brand-border rounded-2xl px-5 py-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
              Confirmed
            </p>
            <p className="text-xs text-gray-400 font-mono">
              {confidencePct}% confidence
            </p>
          </div>
          <p className="text-3xl font-bold text-white font-mono mb-3">
            {confirmedLetter || "—"}
          </p>
          {/* Confidence bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-150 ${barColor}`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
