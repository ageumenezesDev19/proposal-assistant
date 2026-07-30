"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  ok: boolean;
  message: string;
}

/** Magic link: no password to manage, and Supabase's built-in mailer is free. */
export async function sendMagicLink(email: string): Promise<AuthResult> {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: `Check ${email} for a sign-in link.` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
