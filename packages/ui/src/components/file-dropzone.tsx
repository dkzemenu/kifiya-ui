"use client";

import { FileText, UploadCloud, X } from "lucide-react";
import { useId, useState } from "react";
import {
  Button,
  DropZone,
  FileTrigger,
  Text as AriaText,
  type DropItem,
  type FileDropItem,
} from "react-aria-components";

import { cn } from "../lib/cn";

export type FileDropzoneProps = {
  /** The files kept so far. */
  value: File[];
  onChange: (files: File[]) => void;
  /** Accepted types as MIME types (`application/pdf`, `image/png`) or extensions (`.pdf`). Empty accepts any. */
  accept?: string[];
  /** Largest accepted file, in bytes. */
  maxSizeBytes?: number;
  /** Allow several files; otherwise a new file replaces the kept one. */
  multiple?: boolean;
  /** Called with the reason when a file is refused (also shown under the zone). */
  onReject?: (reason: string, file: File) => void;
  /** Names the zone, e.g. "MOU document". */
  label: string;
  /** What to tell the user about accepted files, e.g. "PDF, JPG or PNG · up to 10 MB". */
  hint?: string;
  browseLabel?: string;
  dropLabel?: string;
  removeLabel?: (fileName: string) => string;
  /** Builds the refusal message; gets the reason and the file. */
  rejectMessage?: (reason: "type" | "size", file: File) => string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  disabled?: boolean;
  className?: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesType(file: File, accept: string[]) {
  if (!accept.length) return true;
  const name = file.name.toLowerCase();
  return accept.some((rule) => {
    const r = rule.toLowerCase();
    if (r.startsWith(".")) return name.endsWith(r);
    if (r.endsWith("/*")) return file.type.startsWith(r.slice(0, -1));
    return file.type === r;
  });
}

/**
 * Drop or browse for files. A file of a type or size the app does not accept
 * is refused with the reason shown and is not kept; kept files can be
 * removed, and with `multiple` off a new file replaces the kept one.
 */
export function FileDropzone({
  value,
  onChange,
  accept = [],
  maxSizeBytes,
  multiple = false,
  onReject,
  label,
  hint,
  browseLabel = "Browse files",
  dropLabel = "Drag a file here, or",
  removeLabel = (name) => `Remove ${name}`,
  rejectMessage = (reason, file) =>
    reason === "type"
      ? `${file.name} isn't an accepted file type.`
      : `${file.name} is larger than ${formatSize(maxSizeBytes ?? 0)}.`,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  disabled,
  className,
}: FileDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const hintId = useId();
  const errorId = useId();
  const invalid =
    Boolean(error) || ariaInvalid === true || ariaInvalid === "true";

  function take(incoming: File[]) {
    const kept: File[] = [];
    let refusal: string | null = null;
    for (const file of incoming) {
      const reason = !matchesType(file, accept)
        ? "type"
        : maxSizeBytes != null && file.size > maxSizeBytes
          ? "size"
          : null;
      if (reason) {
        refusal = rejectMessage(reason, file);
        onReject?.(refusal, file);
      } else {
        kept.push(file);
      }
    }
    setError(refusal);
    if (!kept.length) return;
    onChange(multiple ? [...value, ...kept] : kept.slice(0, 1));
  }

  const describedBy =
    [ariaDescribedBy, hint ? hintId : undefined, error ? errorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div data-slot="file-dropzone" className={cn("grid gap-2", className)}>
      <DropZone
        aria-label={label}
        isDisabled={disabled}
        onDrop={async (event) => {
          const files = await Promise.all(
            event.items
              .filter(
                (item: DropItem): item is FileDropItem => item.kind === "file",
              )
              .map((item) => item.getFile()),
          );
          take(multiple ? files : files.slice(0, 1));
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-(--radius-panel) border-2 border-dashed border-(--border-muted) bg-(--surface-subtle) px-6 py-8 text-center outline-none transition-colors",
          "data-[drop-target]:border-(--brand-primary) data-[drop-target]:bg-(--brand-primary-soft) data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--brand-primary) data-[disabled]:opacity-50",
          invalid && "border-(--status-danger)",
        )}
      >
        <UploadCloud className="size-6 text-(--text-muted)" aria-hidden />
        <AriaText slot="label" className="text-sm text-(--text-body)">
          <span className="font-medium text-(--text-strong)">{label}</span>
          <span className="block">{dropLabel}</span>
        </AriaText>
        <FileTrigger
          acceptedFileTypes={accept.length ? accept : undefined}
          allowsMultiple={multiple}
          onSelect={(list) => list && take(Array.from(list))}
        >
          <Button
            isDisabled={disabled}
            aria-describedby={describedBy}
            className="inline-flex h-9 items-center rounded-(--radius-control) border border-(--border-muted) bg-(--surface-card) px-3 text-sm font-medium text-(--text-strong) outline-none hover:bg-(--surface-hover) data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--brand-primary)"
          >
            {browseLabel}
          </Button>
        </FileTrigger>
        {hint ? (
          <p id={hintId} className="text-xs text-(--text-muted)">
            {hint}
          </p>
        ) : null}
      </DropZone>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-(--status-danger-strong)"
        >
          {error}
        </p>
      ) : null}
      {value.length ? (
        <ul className="grid gap-2" aria-label={`${label}, chosen files`}>
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-(--radius-control) border border-(--border-soft) bg-(--surface-card) px-3 py-2 text-sm"
            >
              <FileText
                className="size-4 shrink-0 text-(--text-muted)"
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-(--text-strong)">
                {file.name}
              </span>
              <span className="text-xs text-(--text-muted)">
                {formatSize(file.size)}
              </span>
              <button
                type="button"
                aria-label={removeLabel(file.name)}
                disabled={disabled}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="inline-flex size-7 items-center justify-center rounded-full text-(--text-muted) hover:bg-(--surface-hover) hover:text-(--text-strong) focus-visible:ring-2 focus-visible:ring-(--brand-primary) focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
