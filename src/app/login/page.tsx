import { AppHeader } from "@/components/app-header";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <AppHeader />

      <main className="mx-auto w-full max-w-sm px-4 pt-16 pb-28 sm:px-6">
        <div className="mb-7">
          <p className="eyebrow mb-2.5">Sign in</p>
          <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
            No password to remember
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            We&apos;ll email you a link. Your cases and proposals stay yours, kept apart from everyone
            else&apos;s by row-level security.
          </p>
        </div>

        <LoginForm linkExpired={params.error === "link-expired"} />
      </main>
    </>
  );
}
