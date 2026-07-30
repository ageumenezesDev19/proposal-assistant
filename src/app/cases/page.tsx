import { AppHeader } from "@/components/app-header";
import { listCases } from "@/lib/actions/cases";
import { getCurrentUser } from "@/lib/actions/auth";
import { demoCases } from "@/lib/demo-data";
import { CasesClient } from "./cases-client";

export default async function CasesPage() {
  const user = await getCurrentUser();
  const cases = user ? await listCases() : null;

  return (
    <>
      <AppHeader current="/cases" userEmail={user?.email ?? null} />

      <main className="mx-auto w-full max-w-3xl px-4 pt-10 pb-28 sm:px-6 sm:pb-20">
        <div className="mb-7">
          <p className="eyebrow mb-2.5">Cases</p>
          <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
            The work your proposals draw from
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Every draft picks the case closest to the job. Write them once, in plain words — what was
            broken, and what changed.
          </p>
        </div>

        <CasesClient cases={cases ?? demoCases} signedIn={Boolean(user)} />
      </main>
    </>
  );
}
