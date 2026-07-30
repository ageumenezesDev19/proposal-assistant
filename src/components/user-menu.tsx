"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

/**
 * The single account entry point. Account state lives here, not on the Profile
 * page — Profile is about voice, this is about who's signed in, and the two
 * were getting confused living together.
 *
 * Signed out there is exactly one thing to do, so the icon is a plain link
 * straight to /login rather than a menu wrapping a single item: a person glyph
 * that opens a panel to reveal one button reads as decoration, and costs two
 * taps to do the only thing it offers.
 */
export function UserMenu({ userEmail }: { userEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const signedIn = Boolean(userEmail);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  async function handleSignOut() {
    if (!window.confirm("Sign out of Pitchfolio?")) return;
    setPending(true);
    await signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="ml-3 flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full
          border border-rule bg-white px-2 text-sm text-ink-soft transition-colors
          hover:border-ink-soft hover:text-ink sm:ml-4 sm:pr-3.5"
      >
        <UserIcon />
        {/* The word is what makes it obvious; the phone keeps just the glyph,
            where the header has no room for it. */}
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative ml-3 sm:ml-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account, signed in as ${userEmail}`}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border
          border-rule bg-white text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
      >
        <UserIcon />
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-moss"
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-3 w-72 rounded-xl border border-rule bg-white p-5 shadow-lg">
          <p className="eyebrow mb-1">Signed in as</p>
          <p className="mb-4 text-sm font-medium break-all">{userEmail}</p>
          <div className="border-t border-rule pt-4">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={pending}
              className="flex min-h-10 w-full items-center justify-center rounded-md border
                border-rule px-3 text-sm text-ink transition-colors hover:border-ink-soft disabled:opacity-50"
            >
              {pending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}
