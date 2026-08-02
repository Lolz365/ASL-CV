import React from "react";

interface ErrorScreenProps {
  message: string;
}

export function ErrorScreen({ message }: ErrorScreenProps) {
  const isCameraError =
    message.toLowerCase().includes("camera") ||
    message.toLowerCase().includes("permission") ||
    message.toLowerCase().includes("notallowed");

  return (
    <div className="absolute inset-0 bg-brand-dark flex flex-col items-center justify-center gap-5 p-8 z-30">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-white text-xl font-semibold">Initialization Failed</h2>
        <p className="text-red-400 text-sm font-mono bg-red-500/10 rounded-lg px-4 py-2 border border-red-500/20">
          {message}
        </p>
      </div>

      {isCameraError && (
        <div className="bg-white/5 rounded-xl p-4 border border-brand-border max-w-sm text-sm text-gray-400 space-y-2">
          <p className="text-white font-medium">Camera permission required</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-500">
            <li>Click the camera icon in your browser’s address bar</li>
            <li>Select “Allow” for camera access</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      )}

      {!isCameraError && (
        <p className="text-gray-500 text-xs font-mono text-center max-w-sm">
          Ensure <code className="text-brand-green">/public/model/model.json</code> exists and the dev server is running.
        </p>
      )}

      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-6 py-2.5 bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/30 hover:border-brand-green text-brand-green rounded-xl text-sm font-mono transition-all"
      >
        Retry
      </button>
    </div>
  );
}
