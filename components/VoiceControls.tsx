"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface VoiceControlsProps {
  listening: boolean;
  speaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

export function VoiceControls({
  listening,
  speaking,
  onStartListening,
  onStopListening
}: VoiceControlsProps) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const RecognitionCtor =
      (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    setSupported(Boolean(RecognitionCtor));
  }, []);

  return (
    <div className="flex w-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Voice Orchestrator</h2>
          <p className="text-sm text-white/70">
            {supported
              ? "Hold the mic button and talk naturally. The AI keeps up in real time."
              : "Voice recognition is not available in this browser. Use the text composer below."}
          </p>
        </div>
        <span className={clsx("text-xs uppercase tracking-[0.35em]", listening ? "text-base-200" : "text-white/50")}> 
          {supported ? (listening ? "Listening" : speaking ? "Responding" : "Idle") : "Unavailable"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={listening ? onStopListening : onStartListening}
          disabled={!supported}
          className={clsx(
            "relative flex h-16 w-16 items-center justify-center rounded-full transition",
            supported
              ? listening
                ? "bg-rose-500 text-white shadow-[0_0_40px_5px_rgba(244,63,94,0.5)]"
                : "bg-base-500 text-white hover:scale-[1.02] hover:shadow-[0_0_40px_5px_rgba(92,108,255,0.45)]"
              : "bg-slate-700/40 text-white/40"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={listening ? "stop" : "start"}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="text-2xl"
            >
              {listening ? "■" : "🎙"}
            </motion.span>
          </AnimatePresence>
        </button>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.35em] text-white/60">
            <span>Adaptive Beamformer</span>
            <span>{speaking ? "Synthesising reply" : listening ? "Capturing voice" : "Standing by"}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{
                width: speaking ? "100%" : listening ? "70%" : "20%",
                opacity: speaking || listening ? 0.9 : 0.45
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-base-500 via-base-400 to-base-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
