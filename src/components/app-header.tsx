import Link from "next/link";
import { UserMenu } from "@/components/user-menu";

const nav = [
  { href: "/", label: "Proposals" },
  { href: "/cases", label: "Cases" },
  { href: "/profile", label: "Profile" },
];

/**
 * Wide screens carry the whole nav in the top bar. On phones the three
 * sections move to a bottom bar — a tool people open every day should keep its
 * navigation under the thumb, and the top row has no space for it at 360px.
 *
 * `userEmail` is omitted (rather than passed as null) by pages that haven't
 * been wired to Supabase yet, so the auth control only appears once a page
 * actually knows the session state.
 *
 * Account state (email, sign out) lives in the UserMenu icon at the right
 * edge, not on the Profile page — Profile is about voice (what drafts sound
 * like), this is about who's signed in, and a plain "Sign out" text link
 * sitting between "Cases" and "Profile" was too easy to hit by mistake.
 */
export function AppHeader({
  current = "/",
  userEmail,
}: {
  current?: string;
  userEmail?: string | null;
}) {
  return (
    <>
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-5xl items-center gap-8 px-4 py-2.5 sm:px-6">
          <Link
            href="/"
            className="flex min-h-11 items-center font-serif text-lg font-semibold tracking-tight"
          >
            Pitch<span className="text-moss">folio</span>
          </Link>

          <nav className="ml-auto flex items-center gap-1">
            <div className="hidden items-center gap-1 sm:flex">
              {nav.map((item) => (
                <TopLink key={item.href} {...item} current={current} />
              ))}
            </div>

            <Link
              href="/new"
              className="ml-2 flex min-h-11 items-center rounded-md border border-moss bg-moss
                px-3.5 text-sm font-medium text-paper transition-colors hover:bg-moss-hover"
            >
              New proposal
            </Link>

            {userEmail !== undefined && <UserMenu userEmail={userEmail} />}
          </nav>
        </div>
      </header>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-rule
          bg-paper/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        {nav.map((item) => {
          const active = item.href === current;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-1 items-center justify-center text-sm transition-colors
                ${active ? "font-medium text-moss" : "text-ink-soft"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function TopLink({
  href,
  label,
  current,
}: {
  href: string;
  label: string;
  current: string;
}) {
  const active = href === current;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center rounded-md px-3 text-sm transition-colors
        ${active ? "bg-paper-sunk text-ink" : "text-ink-soft hover:text-ink"}`}
    >
      {label}
    </Link>
  );
}
