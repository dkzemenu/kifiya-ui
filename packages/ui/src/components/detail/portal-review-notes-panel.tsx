"use client";

import { useId, useMemo, useState } from "react";

import { PageSectionCard } from "../page-section-card";
import { PortalButton } from "../portal-button";

export interface PortalReviewNote {
  id: string;
  message: string;
  createdAt: string;
}

export interface PortalReviewNotesPanelProps {
  notes: PortalReviewNote[];
  onSaveNote: (note: string) => void;
  placeholder?: string;
  /** Inline section inside a parent card (no outer PageSectionCard wrapper). */
  variant?: "card" | "embedded";
}

export function PortalReviewNotesPanel({
  notes,
  onSaveNote,
  placeholder = "Add review notes visible to subsequent reviewers",
  variant = "card",
}: PortalReviewNotesPanelProps) {
  const headingId = useId();
  const [draft, setDraft] = useState("");
  const canSave = draft.trim().length > 0;
  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notes],
  );

  const notesFieldClassName =
    "min-h-[120px] w-full resize-y rounded-(--radius-card) border border-(--border-muted) bg-(--surface-card) px-4 py-3 text-sm text-(--text-strong) shadow-none outline-none transition-colors placeholder:text-(--text-placeholder) focus-visible:border-(--brand-primary) focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)] disabled:cursor-not-allowed disabled:opacity-50";

  const body = (
    <div className="space-y-4">
      <div className="space-y-3">
        <textarea
          aria-label="Review notes input"
          value={draft}
          placeholder={placeholder}
          rows={4}
          onChange={(event) => setDraft(event.target.value)}
          className={notesFieldClassName}
        />
        <div className="flex justify-end">
          <PortalButton
            type="button"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) {
                return;
              }
              onSaveNote(draft.trim());
              setDraft("");
            }}
            className="rounded-(--radius-input)"
          >
            Save Notes
          </PortalButton>
        </div>
      </div>

      {sortedNotes.length ? (
        <ul className="space-y-2">
          {sortedNotes.map((note) => (
            <li
              key={note.id}
              className="rounded-(--radius-control) border border-(--border-soft) px-3 py-2"
            >
              <p className="text-sm text-(--text-heading)">{note.message}</p>
              <p className="text-xs text-(--text-muted)">{note.createdAt}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  if (variant === "embedded") {
    return (
      <section
        className="flex w-full min-w-0 flex-col gap-3"
        aria-labelledby={headingId}
      >
        <h4
          id={headingId}
          className="text-sm font-semibold text-(--text-heading)"
        >
          Review Notes
        </h4>
        <div className="min-w-0 w-full rounded-(--radius-card) border border-(--border-soft) bg-(--surface-card) p-4 shadow-sm">
          {body}
        </div>
      </section>
    );
  }

  return (
    <PageSectionCard title="Review Notes">
      <div className="min-w-0 w-full">{body}</div>
    </PageSectionCard>
  );
}
