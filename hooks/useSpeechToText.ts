"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface STTResult {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechToTextResult {
  isListening: boolean;
  isSupported: boolean;
  captions: string[]; // finalized spoken lines
  interimCaption: string; // live partial result
  startListening: () => void;
  stopListening: () => void;
  clearCaptions: () => void;
}

export function useSpeechToText(): SpeechToTextResult {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [interimCaption, setInterimCaption] = useState("");

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    rec.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) {
            setCaptions((prev) => [...prev.slice(-49), text]); // keep last 50 lines
          }
          setInterimCaption("");
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimCaption(interim);
    };

    recognitionRef.current = rec;
    rec.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimCaption("");
  }, []);

  const clearCaptions = useCallback(() => {
    setCaptions([]);
    setInterimCaption("");
  }, []);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  return {
    isListening,
    isSupported,
    captions,
    interimCaption,
    startListening,
    stopListening,
    clearCaptions,
  };
}
