"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const PAUSE_TIMEOUT_MS = 2200; // auto-commit word after 2.2s of no new letters

export interface WordAccumulatorResult {
  currentWord: string;
  sentences: string[]; // finalized sentences (space gesture = word break, pause = word break)
  fullTranscript: string;
  pushLetter: (letter: string) => void;
  clearAll: () => void;
  undoLast: () => void;
}

export function useWordAccumulator(): WordAccumulatorResult {
  const [currentWord, setCurrentWord] = useState("");
  const [sentences, setSentences] = useState<string[]>([]);
  const [fullTranscript, setFullTranscript] = useState("");
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitWord = useCallback((word: string) => {
    if (!word.trim()) return;
    setSentences((prev) => {
      const last = prev[prev.length - 1] ?? "";
      const updated = last.split(" ").length < 8
        ? [...prev.slice(0, -1), (last + " " + word).trim()]
        : [...prev, word];
      return updated.slice(-20); // keep last 20 sentences
    });
    setFullTranscript((prev) => (prev ? prev + " " + word : word));
    setCurrentWord("");
  }, []);

  const pushLetter = useCallback(
    (letter: string) => {
      if (letter === "nothing") return;

      // Clear any pending pause timer on new input
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

      if (letter === "space") {
        setCurrentWord((w) => {
          commitWord(w);
          return "";
        });
        return;
      }

      if (letter === "del") {
        setCurrentWord((w) => w.slice(0, -1));
        return;
      }

      setCurrentWord((w) => w + letter);

      // Auto-commit word after pause
      pauseTimerRef.current = setTimeout(() => {
        setCurrentWord((w) => {
          if (w) commitWord(w);
          return "";
        });
      }, PAUSE_TIMEOUT_MS);
    },
    [commitWord]
  );

  const clearAll = useCallback(() => {
    setCurrentWord("");
    setSentences([]);
    setFullTranscript("");
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
  }, []);

  const undoLast = useCallback(() => {
    // If mid-word, delete last letter; otherwise pop last word from transcript
    setCurrentWord((w) => {
      if (w.length > 0) return w.slice(0, -1);
      return w;
    });
    setSentences((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const words = last.split(" ");
      if (words.length <= 1) return prev.slice(0, -1);
      return [...prev.slice(0, -1), words.slice(0, -1).join(" ")];
    });
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  return { currentWord, sentences, fullTranscript, pushLetter, clearAll, undoLast };
}
