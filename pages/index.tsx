import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";

import { useAslRecognizer } from "../hooks/useAslRecognizer";
import { useTTS } from "../hooks/useTTS";
import { CameraView } from "../components/CameraView";
import { TranslationBanner } from "../components/TranslationBanner";
import { SettingsPanel } from "../components/SettingsPanel";
import { LoadingScreen } from "../components/LoadingScreen";
import { ErrorScreen } from "../components/ErrorScreen";

const Home: NextPage = () => {
  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const {
    videoRef,
    canvasRef,
    confirmedLetter,
    currentPrediction,
    wordBuffer,
    isLoading,
    loadingStage,
    error,
    clearWord,
  } = useAslRecognizer();

  const { speak } = useTTS(ttsEnabled);

  // Speak every newly confirmed letter
  useEffect(() => {
    if (confirmedLetter && confirmedLetter !== "nothing") {
      speak(confirmedLetter);
    }
  }, [confirmedLetter, speak]);

  return (
    <>
      <Head>
        <title>ASL-CV — Real-time Sign Language Recognition</title>
        <meta
          name="description"
          content="Client-side ASL recognition using MediaPipe Hands and TensorFlow.js"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Root: fills full viewport */}
      <main className="relative w-screen h-screen bg-brand-dark overflow-hidden">
        {/* Camera canvas — always rendered so refs are available */}
        <CameraView
          videoRef={videoRef}
          canvasRef={canvasRef}
          isLoading={isLoading}
        />

        {/* Loading overlay */}
        {isLoading && !error && <LoadingScreen stage={loadingStage} />}

        {/* Error overlay */}
        {error && <ErrorScreen message={error} />}

        {/* Live UI — only when running */}
        {!isLoading && !error && (
          <>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤟</span>
                <span className="text-white font-bold text-lg tracking-tight">
                  ASL
                  <span className="text-brand-green">–CV</span>
                </span>
              </div>

              <button
                onClick={() => setSettingsOpen((o) => !o)}
                className="p-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-brand-border text-gray-400 hover:text-white hover:border-brand-green transition-all"
                aria-label="Toggle settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Translation banner at bottom */}
            <TranslationBanner
              confirmedLetter={confirmedLetter}
              currentPrediction={currentPrediction}
              wordBuffer={wordBuffer}
              onClearWord={clearWord}
              ttsEnabled={ttsEnabled}
            />

            {/* Settings side panel */}
            <SettingsPanel
              ttsEnabled={ttsEnabled}
              onTtsToggle={setTtsEnabled}
              isVisible={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />
          </>
        )}
      </main>
    </>
  );
};

export default Home;
