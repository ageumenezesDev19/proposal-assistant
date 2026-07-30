import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeJobPost } from "@/lib/ai/analyze";
import { createClient } from "@/lib/supabase/server";
import { checkAnalyzeLimit } from "@/lib/rate-limit";

const requestSchema = z.object({
  jobPost: z
    .string()
    .min(80, "Paste the full job post — 80 characters minimum.")
    // A real job post is a few paragraphs. Anything past this is either
    // pasted by mistake or an attempt to run up token cost on a shared key.
    .max(6000, "That's too long — trim it to the job post itself."),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Requiring a session here is the main defense: it turns an open endpoint
  // that anyone could script against into one gated by Supabase's own
  // signup/OTP rate limits, and ties every request to an accountable user_id.
  if (!user) {
    return NextResponse.json({ error: "Sign in to analyse a job post." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  // Admin bypasses the hourly cap — see supabase/schema.sql for how the flag
  // is set (service_role only, never through the app) and why.
  if (!profile?.is_admin) {
    const limit = await checkAnalyzeLimit(user.id);
    if (!limit.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000));
      return NextResponse.json(
        { error: "You've hit the hourly limit for job-post analysis. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
      );
    }
  }

  const body = requestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 });
  }

  const { data: cases, error: casesError } = await supabase
    .from("cases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (casesError) {
    return NextResponse.json({ error: "Couldn't load your case studies." }, { status: 500 });
  }

  try {
    const result = await analyzeJobPost(body.data.jobPost, cases ?? []);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    // Both free-tier providers refusing (usually rate limits) is the one case
    // worth telling the visitor about directly, so demo mode reads as a choice.
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
