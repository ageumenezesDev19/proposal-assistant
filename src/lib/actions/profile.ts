"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exampleProfile, type ExampleProfile } from "@/lib/demo-data";

export type ProfileData = ExampleProfile;

/**
 * Returns the example profile for a signed-out visitor. For a signed-in user,
 * returns their real row as-is — including empty fields on a brand-new
 * account — rather than papering over blanks with example content, which
 * would let someone save the placeholder as their real profile by accident.
 */
export async function getProfile(): Promise<ProfileData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return exampleProfile;

  const { data } = await supabase
    .from("profiles")
    .select("headline, bio, stack, avoid_scope")
    .eq("id", user.id)
    .single();

  if (!data) return { headline: "", bio: "", stack: [], avoidScope: "" };

  return {
    headline: data.headline,
    bio: data.bio,
    stack: data.stack,
    avoidScope: data.avoid_scope,
  };
}

export async function saveProfile(input: ProfileData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to save your profile.");

  const { error } = await supabase
    .from("profiles")
    .update({
      headline: input.headline,
      bio: input.bio,
      stack: input.stack,
      avoid_scope: input.avoidScope,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/profile");
}
