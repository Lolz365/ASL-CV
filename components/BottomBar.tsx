import React from "react";

interface BottomBarProps {
  mode: "signing" | "conversation";
  onModeChange: (mode: "signing" | "conversation") => void;
  isListening: boolean;
  isSttSupported: boolean;
  onMicToggle: () => void;
  ttsEnabled: boolean;
  onTtsToggle: () => void;
  onUndo: () => void;
  onClearAll: () => void;
}

export function BottomBar({
  mode,
  onModeChange,
  isListening,
  isSttSupported,
  onMicToggle,
  ttsEnabled,
  onTtsToggle,
  onUndo,
  onClearAll,
}: BottomBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-5 pt-3">
      <div className="bg-black/80 backdrop-blur-xl border border-brand-border rounded-2xl px-4 py-3 flex items-center gap-3">
        {/* Mode toggle */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
          <button
            onClick={() => onModeChange("signing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              mode === "signing"
                ? "bg-brand-green text-black font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ✋ Sign
          </button>
          <button
            onClick={() => onModeChange("conversation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              mode === "conversation"
                ? "bg-brand-green text-black font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            💬 Chat
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mic (for the hearing person's side) */}
        {isSttSupported && (
          <button
            onClick={onMicToggle}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? "bg-blue-500/20 border-blue-400 text-blue-400 animate-pulse-slow"
                : "border-brand-border text-gray-400 hover:text-white hover:border-brand-green"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}

        {/* TTS toggle */}
        <button
          onClick={onTtsToggle}
          aria-label={ttsEnabled ? "Mute speech" : "Enable speech"}
          className={`p-2.5 rounded-xl border transition-all ${
            ttsEnabled
              ? "border-brand-green text-brand-green"
              : "border-brand-border text-gray-500 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {ttsEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9 12H3" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
          </svg>
        </button>

        {/* Undo */}
        <button
          onClick={onUndo}
          aria-label="Undo last letter"
          className="p-2.5 rounded-xl border border-brand-border text-gray-400 hover:text-white hover:border-brand-green transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        {/* Clear */}
        <button
          onClick={onClearAll}
          aria-label="Clear all"
          className="p-2.5 rounded-xl border border-brand-border text-gray-400 hover:text-red-400 hover:border-red-400/50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
