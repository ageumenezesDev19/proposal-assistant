import { AppHeader } from "@/components/app-header";
import { Manuscript } from "@/components/proposal/manuscript";
import { Ledger } from "@/components/proposal/ledger";
import { Button } from "@/components/ui/button";
import { demoAnalysis, demoDraft, demoProposals } from "@/lib/demo-data";

export default function Home() {
  return (
    <>
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl px-4 pt-10 pb-28 sm:px-6 sm:pb-20">
        <div className="mb-7">
          <p className="eyebrow mb-2.5">Draft</p>
          <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
            Shopify inventory dashboard
          </h1>
          <p className="mt-2 font-mono text-xs text-ink-soft">
            Analysed 40s ago · Llama 3.3 70B · 1,240 tokens
          </p>
        </div>

        <Manuscript draft={demoDraft} analysis={demoAnalysis} />

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button>Copy proposal</Button>
          <Button variant="quiet">Save draft</Button>
          <Button variant="quiet">Mark as sent</Button>
        </div>

        <Ledger proposals={demoProposals} />
      </main>
    </>
  );
}
