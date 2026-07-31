"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  ok: boolean;
  message: string;
}

/**
 * Where the emailed link should land. The request's own origin is the most
 * reliable source — it follows preview deployments and the LAN address a phone
 * uses — but it falls back to the configured site URL, then to the deployment
 * URL Vercel injects, so a missing Origin header can't produce a link to
 * "null/auth/callback".
 *
 * Supabase only honours this if the URL matches its Redirect URLs allowlist;
 * otherwise it quietly substitutes the dashboard's Site URL. Both have to list
 * the deployment, or sign-in links point at localhost.
 */
async function callbackUrl(): Promise<string> {
  const origin =
    (await headers()).get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return `${origin}/auth/callback`;
}

/** Magic link: no password to manage, and Supabase's built-in mailer is free. */
export async function sendMagicLink(email: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: await callbackUrl() },
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
