import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Auralis | Conversational Video AI",
  description:
    "Speak naturally and receive rich video-guided responses from an adaptive AI companion that talks back."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <div className="relative isolate min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
            <div className="absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-base-400/80 via-base-500/70 to-base-300/90 blur-3xl" />
            <div className="absolute -bottom-20 left-1/4 h-[34rem] w-[38rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-800/70 via-base-600/40 to-base-400/50 blur-[120px]" />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
