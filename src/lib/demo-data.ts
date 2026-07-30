/**
 * Seeded content for demo mode: a visitor can walk the whole flow without an
 * account, and without spending the free AI quota. Real data will arrive from
 * Supabase with the same shapes, so the components never learn where it came
 * from.
 */

export interface ExampleProfile {
  headline: string;
  bio: string;
  stack: string[];
  avoidScope: string;
}

/**
 * Shown to a signed-out visitor on the Profile page, and as placeholder text
 * for a signed-in user's still-empty fields. A fictional freelancer, not
 * Ageu's real bio — otherwise a demo visitor (or a fresh signup) would see
 * his actual LinkedIn copy and mistake it for their own saved profile.
 */
export const exampleProfile: ExampleProfile = {
  headline: "Independent developer, one client at a time",
  bio: "Most of the work I take on starts as a manual process eating someone's week — a spreadsheet, a form, a report nobody trusts. I replace it with something the team opens every morning without thinking about it.",
  stack: ["Vue", "Laravel", "MySQL", "Redis"],
  avoidScope: "Unpaid trial projects, fixed price without a clear spec",
};

export type ProposalStatus = "draft" | "sent" | "replied" | "won" | "lost";

export interface Annotation {
  id: string;
  kind: "requirements" | "budget" | "flag" | "case";
  label: string;
  /** Paragraph this note comments on, drawn as a connector on wide screens. */
  anchorId?: string;
}

export interface Analysis {
  requirements: string[];
  budget: { range: string; timeline: string };
  flag?: { title: string; body: string };
  bestCase?: { title: string; match: number };
}

export interface Draft {
  greeting: string;
  paragraphs: { id: string; text: string; noteId?: string }[];
}

export interface Proposal {
  id: string;
  jobTitle: string;
  budget: string;
  sentOn: string;
  status: ProposalStatus;
}

/**
 * The evidence a proposal is built from. The result field is what makes a
 * draft persuasive, so the form asks for it plainly rather than leaving it to
 * a generic description.
 */
export interface Case {
  id: string;
  title: string;
  context: string;
  problem: string;
  result: string;
  stack: string[];
}

export const demoCases: Case[] = [
  {
    id: "c1",
    title: "Inventory & production system",
    context: "Retail client · freelance contract · 2025–present",
    problem:
      "The team reconciled stock by hand across spreadsheets every morning, and nobody trusted the numbers by the afternoon.",
    result:
      "One system used daily by the whole team: 28 routes, role-based access, and XLSX/PDF exports that replaced the manual reconciliation.",
    stack: ["Next.js 15", "React 19", "TypeScript", "Playwright"],
  },
  {
    id: "c2",
    title: "DesPensa — desktop inventory app",
    context: "Own product · shipped 2024",
    problem:
      "Small households and shops track stock in notebooks, and lose the history the moment a page is lost.",
    result:
      "A cross-platform desktop app with multiple profiles, backup and restore, and offline-first storage.",
    stack: ["Tauri", "React", "TypeScript"],
  },
];

/**
 * Example blocks for demo mode. Without these the feature reads as an empty
 * box to anyone without an account, and a visitor never sees what it does.
 */
export const demoSnippets = [
  {
    id: "s1",
    label: "Fixed-price terms",
    body: "I quote fixed price once the scope is written down and we both agree on it. Before that I'd rather work hourly for a short discovery — it protects you from paying for my guesswork, and me from absorbing scope that grew.",
  },
  {
    id: "s2",
    label: "How I start",
    body: "The first week is always the same: I get the thing running end to end, however roughly, so we're looking at something real instead of a document. Everything after that is informed by what we learn from it.",
  },
];

export const demoAnalysis: Analysis = {
  requirements: ["React", "Shopify API", "Dashboards", "CSV export"],
  budget: { range: "$3,000–5,000", timeline: "4 weeks · fixed price" },
  flag: {
    title: "Watch out",
    body: '"Custom reports" is not specified. Ask for one example before committing to a fixed price.',
  },
  bestCase: { title: "Inventory system — retail client", match: 92 },
};

export const demoDraft: Draft = {
  greeting: "Hi Sarah,",
  paragraphs: [
    {
      id: "p1",
      noteId: "budget",
      text: "You mentioned the team loses about two hours a day reconciling stock between Shopify and the warehouse sheet. That is the part I would fix first — before adding any new reporting on top of numbers nobody trusts yet.",
    },
    {
      id: "p2",
      text: "I build inventory software for a retail client in production today: 28 screens, role-based access, and XLSX/PDF exports the team actually uses every morning. The reconciliation problem you described is the one I solved for them in week two.",
    },
    {
      id: "p3",
      noteId: "flag",
      text: 'For the reporting piece, I would want to see one example of a report you send today before quoting it. "Custom reports" can mean a table or a full BI layer, and the difference is four weeks.',
    },
    {
      id: "p4",
      text: "Happy to walk through the architecture on a short call.",
    },
  ],
};

export const demoProposals: Proposal[] = [
  {
    id: "1",
    jobTitle: "Inventory dashboard for Shopify store",
    budget: "$3–5k",
    sentOn: "Jul 24",
    status: "won",
  },
  {
    id: "2",
    jobTitle: "Next.js marketing site rebuild",
    budget: "$2k",
    sentOn: "Jul 22",
    status: "replied",
  },
  {
    id: "3",
    jobTitle: "React Native app — bug triage",
    budget: "$45/h",
    sentOn: "Jul 19",
    status: "sent",
  },
];

/** Share of proposals that got any reply — the number the product exists for. */
export function replyRate(proposals: Proposal[]) {
  if (proposals.length === 0) return { percent: 0, total: 0 };
  const replied = proposals.filter((p) =>
    ["replied", "won", "lost"].includes(p.status),
  ).length;
  return {
    percent: Math.round((replied / proposals.length) * 100),
    total: proposals.length,
  };
}
