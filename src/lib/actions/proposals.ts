"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Analysis, Draft, Proposal, ProposalStatus } from "@/lib/demo-data";

/** Returns null for a signed-out visitor — the page falls back to demo proposals. */
export async function listProposals(): Promise<Proposal[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    jobTitle: row.job_title,
    budget: row.budget,
    sentOn: row.sent_on ?? "",
    status: row.status,
  }));
}

export interface SaveDraftInput {
  jobTitle: string;
  jobPost: string;
  budget: string;
  analysis: Analysis;
  draft: Draft;
}

export async function saveDraft(input: SaveDraftInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to save a proposal.");

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      user_id: user.id,
      job_title: input.jobTitle,
      job_post: input.jobPost,
      budget: input.budget,
      analysis: input.analysis,
      draft: input.draft,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data.id as string;
}

export async function updateProposalStatus(id: string, status: ProposalStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to manage your proposals.");

  // Any status past "draft" means it went out, so stamp the date if it isn't
  // stamped yet — someone who marks a proposal "replied" without passing
  // through "sent" first would otherwise leave the Sent column empty forever.
  const { data: current } = await supabase
    .from("proposals")
    .select("sent_on")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const needsSentDate = status !== "draft" && !current?.sent_on;

  const { error } = await supabase
    .from("proposals")
    .update({
      status,
      ...(needsSentDate ? { sent_on: new Date().toISOString().slice(0, 10) } : {}),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}
