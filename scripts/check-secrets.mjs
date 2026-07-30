/**
 * Verifies the credentials in .env.local actually work, without ever printing
 * one. Reports presence, a shape check, and the result of a real request to
 * each service.
 *
 *   node scripts/check-secrets.mjs
 */
process.loadEnvFile(".env.local");

const results = [];

function report(name, ok, detail) {
  results.push({ name, ok, detail });
}

/** Never prints the value — only whether it is there and how long it is. */
function presence(key) {
  const value = process.env[key];
  if (!value) return { present: false };
  return { present: true, length: value.length };
}

// --- Supabase ---------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supa = presence("NEXT_PUBLIC_SUPABASE_ANON_KEY");

if (!supabaseUrl || !supa.present) {
  report("Supabase", false, "missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
} else if (!supabaseKey.startsWith("eyJ") && !supabaseKey.startsWith("sb_")) {
  report("Supabase", false, `key shape unexpected (${supa.length} chars) — expected a JWT (eyJ…) or sb_… publishable key`);
} else {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabaseKey },
    });
    report("Supabase", response.ok, `auth health responded ${response.status} · key ${supa.length} chars`);
  } catch (error) {
    report("Supabase", false, `request failed: ${error.message}`);
  }
}

// --- Groq (primary provider) ------------------------------------------------
const groq = presence("GROQ_API_KEY");
if (!groq.present) {
  report("Groq", false, "GROQ_API_KEY not set");
} else {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    });
    const body = response.ok ? await response.json() : null;
    const count = body?.data?.length ?? 0;
    report("Groq", response.ok, response.ok
      ? `authenticated · ${count} models available · key ${groq.length} chars`
      : `HTTP ${response.status} — key rejected`);
  } catch (error) {
    report("Groq", false, `request failed: ${error.message}`);
  }
}

// --- Gemini (fallback provider) --------------------------------------------
const gemini = presence("GEMINI_API_KEY");
if (!gemini.present) {
  report("Gemini", null, "not set — optional, the fallback lane stays empty");
} else {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );
    const body = response.ok ? await response.json() : null;
    const count = body?.models?.length ?? 0;
    report("Gemini", response.ok, response.ok
      ? `authenticated · ${count} models available · key ${gemini.length} chars`
      : `HTTP ${response.status} — key rejected`);
  } catch (error) {
    report("Gemini", false, `request failed: ${error.message}`);
  }
}

// --- Output -----------------------------------------------------------------
for (const { name, ok, detail } of results) {
  const mark = ok === null ? "–" : ok ? "OK  " : "FAIL";
  console.log(`${mark} ${name.padEnd(9)} ${detail}`);
}

const failed = results.filter((r) => r.ok === false);
process.exit(failed.length > 0 ? 1 : 0);