import React from "react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLoading: boolean;
}

export function CameraView({ videoRef, canvasRef, isLoading }: CameraViewProps) {
  return (
    <div className="relative w-full h-full">
      {/* Hidden video element — MediaPipe reads from this */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
        playsInline
        muted
        autoPlay
      />
      {/* Canvas receives drawn frames + landmark overlay */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* Vignette overlay for visual depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </div>
  );
}
