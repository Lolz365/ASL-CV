import React from "react";

interface SettingsPanelProps {
  ttsEnabled: boolean;
  onTtsToggle: (val: boolean) => void;
  isVisible: boolean;
  onClose: () => void;
}

export function SettingsPanel({
  ttsEnabled,
  onTtsToggle,
  isVisible,
  onClose,
}: SettingsPanelProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-brand-panel/95 backdrop-blur-xl border-l border-brand-border flex flex-col z-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-brand-border">
        <div>
          <h2 className="text-white font-semibold text-lg">Settings</h2>
          <p className="text-gray-500 text-xs font-mono mt-0.5">ASL-CV Configuration</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          aria-label="Close settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Settings items */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* TTS Toggle */}
        <div className="space-y-2">
          <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-widest">
            Audio
          </h3>
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3.5 border border-brand-border">
            <div>
              <p className="text-white text-sm font-medium">Text-to-Speech</p>
              <p className="text-gray-500 text-xs mt-0.5">Speak confirmed letters aloud</p>
            </div>
            <button
              onClick={() => onTtsToggle(!ttsEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-brand-panel ${
                ttsEnabled ? "bg-brand-green" : "bg-white/20"
              }`}
              role="switch"
              aria-checked={ttsEnabled}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  ttsEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-2">
          <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-widest">
            Recognition
          </h3>
          <div className="bg-white/5 rounded-xl p-4 border border-brand-border space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Confidence threshold</span>
              <span className="text-brand-green text-sm font-mono">80%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Frames to confirm</span>
              <span className="text-brand-green text-sm font-mono">10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Camera resolution</span>
              <span className="text-brand-green text-sm font-mono">640×480</span>
            </div>
          </div>
        </div>

        {/* Gesture guide */}
        <div className="space-y-2">
          <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-widest">
            Special Gestures
          </h3>
          <div className="bg-white/5 rounded-xl p-4 border border-brand-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">space</span>
              <span className="text-white font-mono">Add space to buffer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">del</span>
              <span className="text-white font-mono">Backspace</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">nothing</span>
              <span className="text-white font-mono">Ignored (no hand)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-brand-border">
        <p className="text-gray-600 text-xs text-center font-mono">
          ASL-CV • 100% client-side inference
        </p>
      </div>
    </div>
  );
}
