const knowledgeBase = [
  {
    matcher: /hello|hi|hey|good\s(morning|evening|afternoon)/i,
    response:
      "Hey there! I'm Auralis, your multimodal co-pilot. Ask me anything and I'll walk you through it with visuals and voice."
  },
  {
    matcher: /what can you do|help|assist/i,
    response:
      "I can brainstorm ideas, explain complex subjects in simple language, guide you through step-by-step plans, and even rehearse conversations with you. Start with a goal and I'll map the route." 
  },
  {
    matcher: /video|visual|show me/i,
    response:
      "While I generate my responses in real-time, I accompany them with a dynamic visual stream so you always have something to follow along with. Tell me what you'd like to understand visually!"
  },
  {
    matcher: /plan|steps|strategy/i,
    response:
      "Here's a quick strategy scaffold: define the outcome, list the constraints, map critical milestones, and test each milestone with a measurable signal. Want me to turn that into a bespoke plan?"
  },
  {
    matcher: /breath|calm|stress|relax/i,
    response:
      "Let's reset together. Inhale for 4 counts, hold for 4, exhale for 6. Repeat that three times while focusing on one win from today. I'm here when you're ready to continue."
  }
];

const spark = [
  "What else should we explore?",
  "Would you like me to synthesise a summary next?",
  "Do you want a visual breakdown or a checklist?",
  "I'm ready when you want to dive deeper."
];

export function craftFallbackResponse(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "I'm ready whenever you are. Just start talking and I'll respond in real time.";
  }

  const directHit = knowledgeBase.find((entry) => entry.matcher.test(trimmed));
  if (directHit) {
    return withSpark(directHit.response);
  }

  return withSpark(
    `Here's my take: ${reflectiveMirror(trimmed)}. I can elaborate with examples, steps, or visuals—just let me know which helps most.`
  );
}

function reflectiveMirror(input: string) {
  if (input.length < 120) {
    return `you're exploring "${input.replace(/\s+/g, " ")}"`;
  }
  return "you're tackling something substantial—let's break it into manageable layers";
}

function withSpark(base: string) {
  const suggestion = spark[Math.floor(Math.random() * spark.length)];
  return `${base}\n\n${suggestion}`;
}
