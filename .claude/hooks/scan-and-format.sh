#!/usr/bin/env bash
# PostToolUse on Edit|Write. Secret scan (blocking) then format (best effort).
INPUT=$(cat)
command -v jq >/dev/null 2>&1 || exit 0   # scanner is best-effort; CI (gitleaks) is the real gate
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
{ [ -z "$FILE" ] || [ ! -f "$FILE" ]; } && exit 0
if grep -nE '(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(api[_-]?key|secret|password|token)([[:space:]]*[=:]|[[:space:]]+)[[:space:]]*["'\''][A-Za-z0-9_\-]{16,}["'\''])' "$FILE" >/dev/null 2>&1; then
  echo "Possible secret written to $FILE. Remove it, load from config/vault instead. (v0 regex scan; CI runs gitleaks as the real gate.)" >&2
  exit 2
fi
# Formatter per stack. Best effort: silent no-op when the tool is not installed.
ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
case "$FILE" in
  *.dart)                 command -v dart >/dev/null 2>&1 && dart format "$FILE" >/dev/null 2>&1;;
  *.kt|*.kts)             command -v ktlint >/dev/null 2>&1 && ktlint -F "$FILE" >/dev/null 2>&1;;
  *.swift)                command -v swiftformat >/dev/null 2>&1 && swiftformat "$FILE" >/dev/null 2>&1;;
  *.ts|*.tsx|*.js|*.jsx)  [ -x "$ROOT/node_modules/.bin/prettier" ] && "$ROOT/node_modules/.bin/prettier" --write "$FILE" >/dev/null 2>&1;;
  *.go)                   command -v gofmt >/dev/null 2>&1 && gofmt -w "$FILE" >/dev/null 2>&1;;
  *.py)                   if command -v ruff >/dev/null 2>&1; then ruff format -q "$FILE" >/dev/null 2>&1;   # stacks/python.md names ruff
                          elif command -v black >/dev/null 2>&1; then black -q "$FILE" >/dev/null 2>&1; fi;;
esac
exit 0
