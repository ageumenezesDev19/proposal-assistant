import Link from "next/link";

const nav = [
  { href: "/", label: "Proposals", current: true },
  { href: "/cases", label: "Cases" },
  { href: "/profile", label: "Profile" },
];

export function AppHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex h-15 max-w-5xl items-center gap-8 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-h-11 items-center font-serif text-lg font-semibold tracking-tight"
        >
          Pitch<span className="text-moss">folio</span>
        </Link>

        <nav className="ml-auto flex gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-md px-3 text-sm transition-colors
                ${
                  item.current
                    ? "bg-paper-sunk text-ink"
                    : "text-ink-soft hover:text-ink"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
