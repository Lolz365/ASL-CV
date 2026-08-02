import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useAslRecognizer } from '../hooks/useAslRecognizer';
import { useTTS } from '../hooks/useTTS';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useWordAccumulator } from '../hooks/useWordAccumulator';
import { CameraView } from '../components/CameraView';
import { BigLetterDisplay } from '../components/BigLetterDisplay';
import { ConversationPanel } from '../components/ConversationPanel';
import { BottomBar } from '../components/BottomBar';
import { SettingsPanel } from '../components/SettingsPanel';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorScreen } from '../components/ErrorScreen';
import type { ConversationEntry } from '../components/ConversationPanel';

const Home: NextPage = () => {
  const [mode, setMode] = useState<'signing' | 'conversation'>('signing');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationLog, setConversationLog] = useState<ConversationEntry[]>([]);
  const lastSpokenWordRef = useRef<string>('');
  const prevSentencesRef = useRef<string[]>([]);
  const prevCaptionsLenRef = useRef(0);

  const { videoRef, canvasRef, confirmedLetter, currentPrediction, isLoading, loadingStage, error } =
    useAslRecognizer();

  const { currentWord, sentences, pushLetter, clearAll, undoLast } = useWordAccumulator();
  const { speak } = useTTS(ttsEnabled);
  const { isListening, isSupported: isSttSupported, captions, interimCaption, startListening, stopListening, clearCaptions } =
    useSpeechToText();

  useEffect(() => {
    if (confirmedLetter) pushLetter(confirmedLetter);
  }, [confirmedLetter, pushLetter]);

  useEffect(() => {
    const prev = prevSentencesRef.current;
    const latest = sentences[sentences.length - 1];
    if (!latest) return;
    const prevLatest = prev[prev.length - 1];
    const prevWords = prevLatest ? prevLatest.split(' ') : [];
    const newWords = latest.split(' ');
    const addedWord = newWords.length > prevWords.length ? newWords[newWords.length - 1] : null;

    if (addedWord && addedWord !== lastSpokenWordRef.current && addedWord.toLowerCase() !== 'nothing') {
      lastSpokenWordRef.current = addedWord;
      speak(addedWord);
      setConversationLog((prev) => [...prev, { id: uuidv4(), type: 'asl', text: addedWord, timestamp: new Date() }]);
    }
    prevSentencesRef.current = sentences;
  }, [sentences, speak]);

  useEffect(() => {
    if (captions.length > prevCaptionsLenRef.current) {
      const newCaptions = captions.slice(prevCaptionsLenRef.current);
      setConversationLog((prev) => [
        ...prev,
        ...newCaptions.map((text) => ({ id: uuidv4(), type: 'spoken' as const, text, timestamp: new Date() })),
      ]);
    }
    prevCaptionsLenRef.current = captions.length;
  }, [captions]);

  const handleMicToggle = useCallback(() => {
    isListening ? stopListening() : startListening();
  }, [isListening, startListening, stopListening]);

  const handleClearAll = useCallback(() => {
    clearAll();
    clearCaptions();
    setConversationLog([]);
    lastSpokenWordRef.current = '';
    prevCaptionsLenRef.current = 0;
    prevSentencesRef.current = [];
  }, [clearAll, clearCaptions]);

  return (
    <>
      <Head>
        <title>ASL-CV — Sign Language Communication</title>
        <meta name="description" content="Real-time ASL recognition and bidirectional communication for deaf and hard-of-hearing users." />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      </Head>

      <main className="relative w-screen h-screen bg-brand-dark overflow-hidden flex">
        {/* Camera pane - always rendered so refs stay alive */}
        <div className={`relative transition-all duration-300 ${ mode === 'conversation' ? 'w-1/2' : 'w-full' } h-full`}>
          <CameraView videoRef={videoRef} canvasRef={canvasRef} isLoading={isLoading} />
          {!isLoading && !error && (
            <BigLetterDisplay
              currentWord={currentWord}
              confirmedLetter={confirmedLetter}
              currentPrediction={currentPrediction}
              sentences={sentences}
            />
          )}
          {!isLoading && !error && (
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-4 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤟</span>
                <span className="text-white font-bold text-lg">
                  ASL<span className="text-brand-green">–CV</span>
                </span>
              </div>
              <button
                onClick={() => setSettingsOpen((o) => !o)}
                className="p-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-brand-border text-gray-400 hover:text-white transition-all"
                aria-label="Settings"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Conversation pane */}
        {mode === 'conversation' && (
          <div className="w-1/2 h-full border-l border-brand-border flex flex-col overflow-hidden">
            <ConversationPanel
              entries={conversationLog}
              interimSpoken={interimCaption}
              currentAslWord={currentWord}
              onClear={handleClearAll}
            />
          </div>
        )}

        {/* Bottom bar */}
        {!isLoading && !error && (
          <BottomBar
            mode={mode}
            onModeChange={setMode}
            isListening={isListening}
            isSttSupported={isSttSupported}
            onMicToggle={handleMicToggle}
            ttsEnabled={ttsEnabled}
            onTtsToggle={() => setTtsEnabled((v) => !v)}
            onUndo={undoLast}
            onClearAll={handleClearAll}
          />
        )}

        <SettingsPanel
          ttsEnabled={ttsEnabled}
          onTtsToggle={setTtsEnabled}
          isVisible={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />

        {isLoading && !error && <LoadingScreen stage={loadingStage} />}
        {error && <ErrorScreen message={error} />}
      </main>
    </>
  );
};

export default Home;
