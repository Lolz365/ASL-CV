import React, { useEffect, useRef } from "react";

export interface ConversationEntry {
  id: string;
  type: "asl" | "spoken";
  text: string;
  timestamp: Date;
}

interface ConversationPanelProps {
  entries: ConversationEntry[];
  interimSpoken: string;
  currentAslWord: string;
  onClear: () => void;
}

export function ConversationPanel({
  entries,
  interimSpoken,
  currentAslWord,
  onClear,
}: ConversationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, interimSpoken]);

  return (
    <div className="flex flex-col h-full bg-brand-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border shrink-0">
        <div>
          <h2 className="text-white font-bold text-base">Conversation</h2>
          <p className="text-gray-500 text-xs font-mono">
            ASL ↔ Spoken — full history
          </p>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-mono text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-brand-border hover:border-red-400/50"
        >
          Clear
        </button>
      </div>

      {/* Message log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="text-4xl">🤟</span>
            <p className="text-gray-600 text-sm font-mono">
              Start signing or tap the mic
              <br />
              to begin a conversation
            </p>
          </div>
        )}

        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`flex ${
              entry.type === "asl" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                entry.type === "asl"
                  ? "bg-brand-green/15 border border-brand-green/30 rounded-tr-sm"
                  : "bg-blue-500/10 border border-blue-500/20 rounded-tl-sm"
              }`}
            >
              <p
                className={`text-sm font-mono uppercase tracking-widest mb-1 ${
                  entry.type === "asl" ? "text-brand-green" : "text-blue-400"
                }`}
              >
                {entry.type === "asl" ? "✋ You (ASL)" : "🎤 Them (spoken)"}
              </p>
              <p className="text-white text-base leading-relaxed">
                {entry.text}
              </p>
              <p className="text-gray-600 text-xs font-mono mt-1">
                {entry.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* In-progress entries */}
        {currentAslWord && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 bg-brand-green/5 border border-brand-green/20 border-dashed">
              <p className="text-xs font-mono text-brand-green/60 uppercase tracking-widest mb-1">
                ✋ Signing...
              </p>
              <p className="text-brand-green/70 text-base font-mono tracking-widest">
                {currentAslWord}
                <span className="animate-pulse">_</span>
              </p>
            </div>
          </div>
        )}

        {interimSpoken && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-blue-500/5 border border-blue-500/15 border-dashed">
              <p className="text-xs font-mono text-blue-400/60 uppercase tracking-widest mb-1">
                🎤 Speaking...
              </p>
              <p className="text-blue-300/70 text-base italic">{interimSpoken}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
