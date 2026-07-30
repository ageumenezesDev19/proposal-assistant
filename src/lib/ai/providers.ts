/**
 * A provider-agnostic lane with automatic failover.
 *
 * Both free tiers are rate limited, and the guidance for free LLM tiers is to
 * never depend on a single one. So the app declares an ordered list: Groq first
 * because it streams at ~750 tokens/s (which is what makes the draft feel
 * instant) and does not train on what it is sent — the user pastes job posts
 * and their own profile. Gemini takes over when Groq refuses.
 *
 * Callers never learn which provider answered; they get tokens and, at the end,
 * the name for the audit line under the draft.
 */

export type ProviderName = "groq" | "gemini";

export interface Provider {
  name: ProviderName;
  model: string;
  /** Absent key means the lane is skipped rather than failing the request. */
  isConfigured(): boolean;
  stream(messages: ChatMessage[], signal?: AbortSignal): Promise<ReadableStream<string>>;
}

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

/** Retrying a bad key or a rejected prompt on the next provider is pointless. */
function isWorthFailingOver(status: number) {
  return status === 429 || status >= 500;
}

class ProviderError extends Error {
  constructor(
    readonly provider: ProviderName,
    readonly status: number,
    readonly failover: boolean,
  ) {
    super(`${provider} responded ${status}`);
  }
}

/** Turns an OpenAI-shaped SSE body into a stream of plain text deltas. */
function readOpenAiStream(
  body: ReadableStream<Uint8Array>,
  pickDelta: (payload: unknown) => string | undefined,
): ReadableStream<string> {
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<string>({
    async start(controller) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE frames are separated by a blank line; keep the partial tail.
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const delta = pickDelta(JSON.parse(data));
              if (delta) controller.enqueue(delta);
            } catch {
              // A malformed frame is not worth killing the whole draft over.
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });
}

const groq: Provider = {
  name: "groq",
  model: "llama-3.3-70b-versatile",
  isConfigured: () => Boolean(process.env.GROQ_API_KEY),
  async stream(messages, signal) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groq.model,
        messages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok || !response.body) {
      throw new ProviderError("groq", response.status, isWorthFailingOver(response.status));
    }

    return readOpenAiStream(
      response.body,
      (payload) =>
        (payload as { choices?: { delta?: { content?: string } }[] })
          .choices?.[0]?.delta?.content,
    );
  },
};

const gemini: Provider = {
  name: "gemini",
  model: "gemini-2.0-flash",
  isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
  async stream(messages, signal) {
    // Gemini keeps the system instruction separate from the conversation.
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const user = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${gemini.model}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents: [{ role: "user", parts: [{ text: user }] }],
        }),
      },
    );

    if (!response.ok || !response.body) {
      throw new ProviderError("gemini", response.status, isWorthFailingOver(response.status));
    }

    return readOpenAiStream(
      response.body,
      (payload) =>
        (payload as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
          .candidates?.[0]?.content?.parts?.[0]?.text,
    );
  },
};

/** Order is the failover order. */
export const providers: Provider[] = [groq, gemini];

export interface StreamResult {
  stream: ReadableStream<string>;
  provider: ProviderName;
  model: string;
}

/**
 * Walks the lane until one provider answers. Throws only when every configured
 * provider refused — the caller then falls back to demo mode rather than
 * showing the visitor a dead screen.
 */
export async function streamCompletion(
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<StreamResult> {
  const configured = providers.filter((provider) => provider.isConfigured());
  if (configured.length === 0) {
    throw new Error("No AI provider is configured. Set GROQ_API_KEY or GEMINI_API_KEY.");
  }

  const failures: string[] = [];

  for (const provider of configured) {
    try {
      const stream = await provider.stream(messages, signal);
      return { stream, provider: provider.name, model: provider.model };
    } catch (error) {
      if (error instanceof ProviderError && !error.failover) throw error;
      if ((error as Error)?.name === "AbortError") throw error;
      failures.push((error as Error).message);
    }
  }

  throw new Error(`Every provider refused: ${failures.join("; ")}`);
}