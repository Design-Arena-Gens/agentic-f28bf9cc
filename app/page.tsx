"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageBubble, MessageRole } from "@/components/MessageBubble";
import { VoiceControls } from "@/components/VoiceControls";
import { VideoAvatar } from "@/components/VideoAvatar";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

const initialGreeting = `Hey, I'm Auralis. Speak freely and I'll respond with voice, visuals, and actionable insight.`;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: cryptoId(),
      role: "assistant",
      content: initialGreeting,
      createdAt: Date.now()
    }
  ]);
  const [composer, setComposer] = useState("");
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const speechSynthesisSupported = useMemo(() => typeof window !== "undefined" && "speechSynthesis" in window, []);

  const speak = useCallback(
    (text: string) => {
      if (!speechSynthesisSupported) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.02;
      utterance.volume = 0.92;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [speechSynthesisSupported]
  );

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to access microphone at the moment.");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const submitMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      const outbound: Message = {
        id: cryptoId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now()
      };

      setMessages((prev) => [...prev, outbound]);
      setProcessing(true);
      setError(null);

      try {
        const response = await fetch("/api/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: messagesRef.current.map(({ role, content }) => ({ role, content }))
          })
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as { reply?: string; error?: string };
        if (data.error) {
          throw new Error(data.error);
        }

        if (data.reply) {
          const inbound: Message = {
            id: cryptoId(),
            role: "assistant",
            content: data.reply,
            createdAt: Date.now()
          };
          setMessages((prev) => [...prev, inbound]);
          speak(data.reply);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong while contacting the AI.";
        setError(message);
        const recovery: Message = {
          id: cryptoId(),
          role: "assistant",
          content: `I couldn't reach my reasoning engine, but here's what I can offer right now. ${message}`,
          createdAt: Date.now()
        };
        setMessages((prev) => [...prev, recovery]);
      } finally {
        setProcessing(false);
      }
    },
    [speak]
  );

  const latestSubmitRef = useRef(submitMessage);

  useEffect(() => {
    latestSubmitRef.current = submitMessage;
  }, [submitMessage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const GlobalSpeechRecognition =
      window.SpeechRecognition || (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!GlobalSpeechRecognition) {
      return;
    }

    const recognition = new GlobalSpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");

      const isFinal = event.results[event.results.length - 1]?.isFinal;
      if (isFinal) {
        setListening(false);
        recognition.stop();
        if (transcript.trim()) {
          setComposer("");
          void latestSubmitRef.current(transcript.trim());
        }
      }
    };

    recognition.onstart = () => {
      setError(null);
      setListening(true);
    };

    recognition.onerror = (event) => {
      setError(event instanceof Error ? event.message : "Voice input failed. Try again.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextMessage = composer.trim();
    if (!nextMessage) return;
    setComposer("");
    void submitMessage(nextMessage);
  };

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center px-4 pb-16 pt-12 sm:px-8">
      <div className="flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-3 text-center sm:text-left">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.4em] text-white/70 backdrop-blur">
            Auralis • Multimodal Dialogue Engine
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Converse naturally, receive cinematic feedback.
          </h1>
          <p className="max-w-3xl text-base text-white/75 sm:text-lg">
            Speak, type, or ideate out loud. Auralis listens, reasons in real time, and answers with expressive visuals, articulate narration, and iterative guidance tailored to you.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <VideoAvatar speaking={speaking} thinking={processing && !speaking} />
            <div className="flex max-h-[28rem] flex-col gap-4 overflow-y-auto rounded-3xl border border-white/10 bg-black/30 p-6 shadow-[0_30px_120px_-35px_rgba(24,33,89,0.75)] backdrop-blur">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  createdAt={new Date(message.createdAt)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <VoiceControls
              listening={listening}
              speaking={speaking}
              onStartListening={startListening}
              onStopListening={stopListening}
            />
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-inner shadow-white/10 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Text Composer</h2>
                <span className="text-xs uppercase tracking-[0.35em] text-white/60">
                  {processing ? "Synthesising" : "Ready"}
                </span>
              </div>
              <textarea
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                placeholder="Ask for a strategy, a rehearsal, or a deep dive."
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/90 outline-none transition focus:border-base-300"
              />
              <button
                type="submit"
                disabled={!composer.trim() || processing}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-base-500 via-base-400 to-base-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-[0_18px_40px_-24px_rgba(92,108,255,0.75)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700/40 disabled:opacity-60"
              >
                {processing ? "Thinking" : "Send"}
              </button>
              {error ? (
                <p className="text-sm text-rose-300/80">{error}</p>
              ) : (
                <p className="text-xs leading-relaxed text-white/60">
                  Pro tip: hold the mic button, ask for a breakdown, then follow-up with &ldquo;show me a different angle&rdquo; to iterate the plan.
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}
