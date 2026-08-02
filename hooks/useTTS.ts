"use client";

import { useCallback, useRef } from "react";

export function useTTS(enabled: boolean) {
  const lastSpokenRef = useRef<string>("");

  const speak = useCallback(
    (text: string) => {
      if (!enabled) return;
      if (!window.speechSynthesis) return;
      if (text === lastSpokenRef.current) return;
      lastSpokenRef.current = text;

      // Cancel any in-progress speech to avoid queue buildup
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      // Prefer a natural-sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang === "en-US" && v.localService
      );
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  const speakWord = useCallback(
    (word: string) => {
      if (!enabled || !word.trim()) return;
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.trim());
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  return { speak, speakWord };
}
