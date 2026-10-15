import { useCallback, useRef } from "react";

type AutoFocusHandler = (event: Event) => void;

/**
 * Returns focus to whatever was focused before a Radix dialog opened.
 *
 * Radix only restores focus to its own `Trigger`. Kit overlays are usually
 * controlled (`open` + `onOpenChange`) and opened from the app's own button,
 * so without this, closing them drops focus to `<body>`.
 */
export function useRestoreFocus(handlers: {
  onOpenAutoFocus?: AutoFocusHandler;
  onCloseAutoFocus?: AutoFocusHandler;
}) {
  const { onOpenAutoFocus, onCloseAutoFocus } = handlers;
  const returnTo = useRef<HTMLElement | null>(null);

  const handleOpen = useCallback(
    (event: Event) => {
      // Runs before focus moves into the dialog, so this is still the opener.
      const active = document.activeElement;
      returnTo.current = active instanceof HTMLElement ? active : null;
      onOpenAutoFocus?.(event);
    },
    [onOpenAutoFocus],
  );

  const handleClose = useCallback(
    (event: Event) => {
      onCloseAutoFocus?.(event);
      if (event.defaultPrevented) return;
      const target = returnTo.current;
      if (target?.isConnected) {
        event.preventDefault();
        target.focus();
      }
    },
    [onCloseAutoFocus],
  );

  return { onOpenAutoFocus: handleOpen, onCloseAutoFocus: handleClose };
}
