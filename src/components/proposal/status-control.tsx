"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ProposalStatus } from "@/lib/demo-data";
import { updateProposalStatus } from "@/lib/actions/proposals";

/** Funnel order, which is also the order the menu lists them in. */
const STATUSES: ProposalStatus[] = ["draft", "sent", "replied", "won", "lost"];

/**
 * Only "won" earns colour. The rest carry weight instead — a ledger where five
 * states each had their own hue would read as a chart, and the one outcome
 * worth spotting across a long list would stop standing out.
 */
const dotStyles: Record<ProposalStatus, string> = {
  draft: "border border-ink-soft/50 bg-transparent",
  sent: "bg-ink-soft/60",
  replied: "bg-ink",
  won: "bg-moss",
  lost: "border border-ink-soft/35 bg-transparent",
};

const labelStyles: Record<ProposalStatus, string> = {
  draft: "text-ink-soft",
  sent: "text-ink-soft",
  replied: "text-ink",
  won: "text-moss",
  lost: "text-ink-soft/70",
};

function StatusDot({ status }: { status: ProposalStatus }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 shrink-0 rounded-full ${dotStyles[status]}`}
    />
  );
}

export function StatusControl({
  id,
  status,
  editable,
}: {
  id: string;
  status: ProposalStatus;
  editable: boolean;
}) {
  const [value, setValue] = useState(status);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => STATUSES.indexOf(status));
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  // The ledger scrolls sideways inside `overflow-x-auto`, which makes the
  // wrapper a clipping context on BOTH axes — an absolutely positioned menu
  // gets cut off. So the menu is fixed and anchored to the trigger's rect.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setAnchor({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    // A fixed menu can't follow its anchor, so it closes rather than drift.
    function onReflow() {
      setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) menuRef.current?.focus();
  }, [open]);

  function commit(next: ProposalStatus) {
    setOpen(false);
    triggerRef.current?.focus();
    if (next === value) return;

    const previous = value;
    setValue(next);
    startTransition(async () => {
      try {
        await updateProposalStatus(id, next);
        router.refresh();
      } catch {
        setValue(previous);
      }
    });
  }

  if (!editable) {
    return (
      <span
        className={`inline-flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase ${labelStyles[status]}`}
      >
        <StatusDot status={status} />
        {status}
      </span>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Status: ${value}. Change it.`}
        onClick={() => {
          setActiveIndex(STATUSES.indexOf(value));
          setOpen((v) => !v);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setActiveIndex(STATUSES.indexOf(value));
            setOpen(true);
          }
        }}
        className={`inline-flex min-h-9 items-center gap-2 rounded-md border border-transparent
          px-2 font-mono text-[11px] tracking-wider uppercase transition-colors
          hover:border-rule hover:bg-paper-sunk disabled:opacity-50
          ${open ? "border-rule bg-paper-sunk" : ""} ${labelStyles[value]}`}
      >
        <StatusDot status={value} />
        {value}
        <svg
          width="9"
          height="6"
          viewBox="0 0 9 6"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1.5 4.5 5 8 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && anchor && (
        <ul
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${id}-status-${STATUSES[activeIndex]}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              triggerRef.current?.focus();
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((i) => (i + 1) % STATUSES.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((i) => (i - 1 + STATUSES.length) % STATUSES.length);
            } else if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              commit(STATUSES[activeIndex]);
            } else if (event.key === "Tab") {
              setOpen(false);
            }
          }}
          style={{ top: anchor.top, right: anchor.right }}
          className="fixed z-30 w-44 overflow-hidden rounded-lg border border-rule
            bg-white py-1 shadow-lg focus:outline-none"
        >
          {STATUSES.map((option, index) => {
            const selected = option === value;
            return (
              <li
                key={option}
                id={`${id}-status-${option}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(option)}
                className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 font-mono
                  text-[11px] tracking-wider uppercase transition-colors
                  ${index === activeIndex ? "bg-paper-sunk" : ""} ${labelStyles[option]}`}
              >
                <StatusDot status={option} />
                <span className="flex-1">{option}</span>
                {selected && (
                  <svg width="11" height="9" viewBox="0 0 11 9" aria-hidden="true">
                    <path
                      d="M1 4.5 4 7.5 10 1.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
