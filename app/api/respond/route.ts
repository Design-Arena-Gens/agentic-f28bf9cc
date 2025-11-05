import { NextResponse } from "next/server";
import { craftFallbackResponse } from "@/lib/fallbackAi";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  history?: ChatMessage[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const history = (body.history ?? []).slice(-8);
    const openAiKey = process.env.OPENAI_API_KEY;

    if (openAiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.7,
            messages: [
              {
                role: "system",
                content:
                  "You are Auralis, a multi-sensory guide who responds in concise, vivid language. Provide actionable insight, maintain warmth, and reference the accompanying visual stream in your wording."
              },
              ...history,
              { role: "user", content: message }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI request failed with status ${response.status}`);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return NextResponse.json({ reply });
        }
      } catch (error) {
        console.error("OpenAI error", error);
      }
    }

    const fallback = craftFallbackResponse(message);
    return NextResponse.json({ reply: fallback });
  } catch (error) {
    console.error("Unexpected error", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
