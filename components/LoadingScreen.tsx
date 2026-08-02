import React from "react";

interface LoadingScreenProps {
  stage: string;
}

export function LoadingScreen({ stage }: LoadingScreenProps) {
  return (
    <div className="absolute inset-0 bg-brand-dark flex flex-col items-center justify-center gap-6 z-30">
      {/* Animated logo */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl border-2 border-brand-green/30 flex items-center justify-center">
          <span className="text-3xl">🤟</span>
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-brand-green animate-spin" style={{ animationDuration: '3s', clipPath: 'inset(0 50% 0 0)' }} />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-white text-2xl font-bold tracking-tight">ASL-CV</h1>
        <p className="text-gray-500 text-sm font-mono">{stage}</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-green animate-pulse-slow"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>

      <p className="text-gray-600 text-xs font-mono max-w-xs text-center">
        Running entirely in your browser.
        <br />
        No data leaves your device.
      </p>
    </div>
  );
}
