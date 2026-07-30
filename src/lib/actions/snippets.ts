"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface Snippet {
  id: string;
  label: string;
  body: string;
}

/** Returns null for a signed-out visitor — the page falls back to demo blocks. */
export async function listSnippets(): Promise<Snippet[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("snippets")
    .select("id, label, body")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSnippet(label: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to save a block.");

  const { error } = await supabase
    .from("snippets")
    .insert({ user_id: user.id, label, body });

  if (error) throw new Error(error.message);
  revalidatePath("/new");
}

export async function deleteSnippet(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to manage your blocks.");

  const { error } = await supabase
    .from("snippets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/new");
}
