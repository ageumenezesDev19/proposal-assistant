import type { Case } from "@/lib/demo-data";
import { streamCompletion, type ProviderName } from "./providers";
import { analysisResultSchema, type AnalysisResult } from "./schema";

const SYSTEM_PROMPT = `You are Pitchfolio's job-post analyst, helping a freelance developer
reply to a client post. Given the raw job post and the developer's saved case studies,
return ONLY a single JSON object — no markdown fences, no commentary — shaped exactly like:

{
  "analysis": {
    "requirements": string[],          // 3-6 concrete technical/functional requirements, shortest useful phrasing
    "budget": { "range": string, "timeline": string },
    "flag": { "title": string, "body": string } | omit if nothing is genuinely ambiguous or risky,
    "bestCase": { "title": string, "match": number } | omit if no case fits well  // match is 0-100
  },
  "draft": {
    "greeting": string,                // e.g. "Hi <name>," — use "there" if no name is given
    "paragraphs": [
      { "id": string, "text": string, "noteId": "budget" | "flag" | "case" (optional) }
    ]                                    // 3-4 paragraphs: acknowledge their real problem, cite the
                                          // single most relevant case with a concrete result, address
                                          // the flag if one exists, close with a low-friction next step
  }
}

Ground every claim in the case studies provided — never invent results, technologies, or experience
that are not in them. Write like a competent developer, not a salesperson: specific, short sentences,
no hype words like "passionate" or "excited".`;

function buildUserPrompt(jobPost: string, cases: Case[]) {
  const caseText = cases.length
    ? cases
        .map(
          (c) =>
            `- ${c.title} (${c.context})\n  Problem: ${c.problem}\n  Result: ${c.result}\n  Stack: ${c.stack.join(", ")}`,
        )
        .join("\n")
    : "(no case studies saved yet — omit bestCase and keep the draft general)";

  return `JOB POST:\n${jobPost}\n\nDEVELOPER'S CASE STUDIES:\n${caseText}`;
}

/** Models occasionally wrap JSON in a fence despite instructions not to. */
function stripCodeFence(text: string) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (match ? match[1] : text).trim();
}

export interface AnalyzeResult extends AnalysisResult {
  provider: ProviderName;
}

export async function analyzeJobPost(
  jobPost: string,
  cases: Case[],
  signal?: AbortSignal,
): Promise<AnalyzeResult> {
  const { stream, provider } = await streamCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(jobPost, cases) },
    ],
    signal,
  );

  let raw = "";
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    raw += value;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(raw));
  } catch {
    throw new Error(`${provider} returned a response that wasn't valid JSON`);
  }

  const result = analysisResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`${provider}'s response didn't match the expected shape: ${result.error.message}`);
  }

  return { ...result.data, provider };
}
