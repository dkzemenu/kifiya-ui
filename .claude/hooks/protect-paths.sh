#!/usr/bin/env bash
# PreToolUse on Edit|Write. Blocks edits under protected paths. Exit 2 = block.
INPUT=$(cat)
command -v jq >/dev/null 2>&1 || { echo "protect-paths: jq not found; protection inactive" >&2; exit 0; }
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] && exit 0
[ "$KIFIYA_ALLOW_PROTECTED" = "1" ] && exit 0
ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
LIST="$ROOT/protected-paths.txt"
[ -f "$LIST" ] || { echo "protect-paths: $LIST not found; protection inactive" >&2; exit 0; }
REL="${FILE#"$ROOT"/}"
while IFS= read -r p; do
  [ -z "$p" ] && continue
  case "$p" in \#*) continue;; esac
  case "$REL" in
    "$p"*) echo "Blocked: '$REL' is under protected path '$p'. Propose the change instead of editing, or the operator reruns with KIFIYA_ALLOW_PROTECTED=1." >&2; exit 2;;
  esac
done < "$LIST"
exit 0
