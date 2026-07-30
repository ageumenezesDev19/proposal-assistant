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

export interface SavedProposal extends Proposal {
  jobPost: string;
  analysis: Analysis;
  draft: Draft;
}

/**
 * The full row, including the parts the ledger doesn't show. Returns null for
 * a missing id as well as a signed-out visitor, so the page can render its own
 * not-found rather than leaking the difference between "no such proposal" and
 * "someone else's proposal".
 */
export async function getProposal(id: string): Promise<SavedProposal | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    jobTitle: data.job_title,
    budget: data.budget,
    sentOn: data.sent_on ?? "",
    status: data.status,
    jobPost: data.job_post,
    analysis: data.analysis as Analysis,
    draft: data.draft as Draft,
  };
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

/** Persists edits made to an already-saved proposal's text. */
export async function updateProposalDraft(id: string, draft: Draft) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to edit a proposal.");

  const { error } = await supabase
    .from("proposals")
    .update({ draft })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/proposals/${id}`);
}

export async function deleteProposal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to manage your proposals.");

  // RLS already scopes this to the caller's rows; the explicit filter keeps
  // the query's intent readable without depending on the policy alone.
  const { error } = await supabase
    .from("proposals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
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
