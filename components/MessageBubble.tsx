"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

export type MessageRole = "user" | "assistant";

export interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export function MessageBubble({ role, content, createdAt }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className={clsx(
        "relative flex w-full gap-3 rounded-3xl px-5 py-4 text-sm shadow-lg shadow-slate-950/20",
        isUser
          ? "ml-auto max-w-[88%] translate-x-1 bg-base-500 text-white"
          : "mr-auto max-w-[90%] bg-white/95 text-slate-900 backdrop-blur"
      )}
    >
      <div
        className={clsx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 transition",
          isUser
            ? "bg-white/20 text-white"
            : "bg-gradient-to-br from-base-300 via-base-500 to-base-700 text-white"
        )}
      >
        {isUser ? "You" : "AI"}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: linkify(content) }} />
        <span className="text-xs uppercase tracking-widest text-white/70">
          {createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}

const urlRegex = /(https?:\/\/[\w\-.~:/?#[\]@!$&'()*+,;=%]+|www\.[\w\-.~:/?#[\]@!$&'()*+,;=%]+)/gi;

function linkify(text: string) {
  return text.replace(urlRegex, (match) => {
    const href = match.startsWith("http") ? match : `https://${match}`;
    return `<a class="text-base-200 underline" target="_blank" rel="noopener noreferrer" href="${href}">${match}</a>`;
  });
}
