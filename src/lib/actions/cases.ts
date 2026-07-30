"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Case } from "@/lib/demo-data";

export interface CaseInput {
  title: string;
  context: string;
  problem: string;
  result: string;
  stack: string[];
}

/** Returns null for a signed-out visitor — the page falls back to demo cases. */
export async function listCases(): Promise<Case[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    context: row.context,
    problem: row.problem,
    result: row.result,
    stack: row.stack,
  }));
}

export async function createCase(input: CaseInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to save a case.");

  const { error } = await supabase.from("cases").insert({ ...input, user_id: user.id });
  if (error) throw new Error(error.message);

  revalidatePath("/cases");
}

export async function deleteCase(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to manage your cases.");

  // RLS already scopes this to the caller's rows; the explicit filter keeps
  // the query's intent readable without depending on the policy alone.
  const { error } = await supabase.from("cases").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/cases");
}
