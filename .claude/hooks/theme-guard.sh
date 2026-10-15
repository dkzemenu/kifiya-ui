#!/usr/bin/env bash
# PostToolUse on Edit|Write. Theme enforcement for web frontend repos. Exit 2 = block.
#
# Opt-in, not auto-detected. Unlike the mobile hooks, "is this a frontend repo"
# is not the question -- a repo can be a frontend and not have adopted a token
# layer yet. So this stays inert until an adopter names its component roots
# below, and one settings.json still serves every repo.
#
# Three rules:
#   1. No literal colours where the token layer should be.
#   2. No raw Tailwind palette colours -- bg-teal-800 bypasses the token layer,
#      so it survives a brand change and breaks dark mode. Use bg-primary.
#   3. No UI or icon library outside the set this repo approved.
#
# Deliberate exception, per session: KIFIYA_ALLOW_THEME_DRIFT=1

# --- repo configuration: the adoption flow fills these two lines --------------

# Directories holding component code, space separated, relative to the repo root.
# EMPTY MEANS THE HOOK DOES NOTHING. Set it when adopting the web frontend
# variant, e.g. "client/src/" or "src/" or "app/ packages/ui/src/".
GUARDED_ROOTS="packages/ apps/"

# UI and icon packages this repo is allowed to import, by npm scope or package
# name. The default is the shadcn/ui set. A repo whose kit is MUI sets
# "@mui @emotion" here; the point is one kit per repo, not one kit per company.
APPROVED_UI_LIBS="@radix-ui lucide-react sonner"

# -----------------------------------------------------------------------------

INPUT=$(cat)
command -v jq >/dev/null 2>&1 || { echo "theme-guard: jq not found; theme enforcement inactive" >&2; exit 0; }
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
{ [ -z "$FILE" ] || [ ! -f "$FILE" ]; } && exit 0
[ "${KIFIYA_ALLOW_THEME_DRIFT:-}" = "1" ] && exit 0
[ -z "${GUARDED_ROOTS// /}" ] && exit 0

REL="${FILE#"$CLAUDE_PROJECT_DIR"/}"

# Exact file, or under a directory at a / boundary. A bare prefix would make
# the entry "lib/avatar" also cover "lib/avatarGenerator2.ts" -- harmless for a
# protected path, which errs toward blocking, but an exemption that over-matches
# silently switches the guard off for files nobody exempted.
path_covers() { # path_covers <entry> <rel>
  local p="$1" rel="$2"
  [ "$rel" = "$p" ] && return 0
  case "$p" in
    */) [ "${rel#"$p"}" != "$rel" ] && return 0 ;;
    *)  [ "${rel#"$p"/}" != "$rel" ] && return 0 ;;
  esac
  return 1
}

# Only guards view-layer source. Everything else exits before a regex runs.
case "$REL" in
  *.tsx|*.jsx|*.ts|*.js|*.vue|*.svelte|*.css|*.scss) ;;
  *) exit 0 ;;
esac

IN_SCOPE=0
for root in $GUARDED_ROOTS; do path_covers "$root" "$REL" && { IN_SCOPE=1; break; }; done
[ "$IN_SCOPE" = "0" ] && exit 0

# The theme layer defines the colours; its own tokens would trip every rule.
# Tests and stories may name colours freely.
case "$REL" in
  */kifiya-theme.css|*/theme.css|*/tailwind.config.ts|*/tailwind.config.js|*/index.css|*/globals.css) exit 0 ;;
  */tests/*|*.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx|*.stories.tsx) exit 0 ;;
esac

# Named exemptions, versioned alongside protected-paths.txt so the list of
# places raw colour is tolerated is itself inspectable.
EXEMPT="$CLAUDE_PROJECT_DIR/theme-exempt-paths.txt"
if [ -f "$EXEMPT" ]; then
  while IFS= read -r p; do
    case "$p" in ""|\#*) continue ;; esac
    path_covers "$p" "$REL" && exit 0
  done < "$EXEMPT"
fi

FAIL=0
note() { echo "$1" >&2; FAIL=1; }

# Comments and data URIs are not colour declarations. Stripping them first
# keeps the rules below from arguing with prose and generated SVG payloads.
BODY=$(sed -e 's://.*::' -e 's:/\*.*\*/::' "$FILE" | grep -v 'data:image/')

# 1. Literal colours, but only where a colour actually lives.
#    A #hex-shaped token is not evidence on its own: a CSS id selector
#    (#cafe { }), a URL fragment (/guide#a1b2c3), a sha in a comment
#    (#deadbeef) and an opaque id ("#123abc") are all indistinguishable from a
#    colour by shape. This hook blocks on every edit, so a rule that fires on
#    those costs more than the drift it catches. Requiring a colour context
#    does mean `const c = "#EB7D23"` slips through; rules 2 and 4 and review
#    cover that, and a false block on ordinary code has no such backstop.
CTX='[Cc]olor|[Cc]olour|[Bb]ackground|[Bb]order|[Oo]utline|[Ff]ill|[Ss]troke|[Ss]hadow|[Tt]int|[Rr]ing|[Aa]ccent|[Bb]rand|[Pp]alette|[Tt]heme|[Gg]radient'
HEX='#[0-9a-fA-F]{3,8}\b'
if printf '%s\n' "$BODY" | grep -qE "\-\[$HEX\]|\-\[(rgb|hsl)a?\(|rgba?\([0-9]|hsla?\([0-9]|($CTX)[A-Za-z-]*[\"']?\s*[:=]\s*[^;{}]{0,40}$HEX"; then
  note "Theme: literal colour in $REL. Tokens are the source of truth and come from the brand hub — use a semantic class (bg-primary, text-muted-foreground, border-border, text-destructive, bg-accent) or a named brand token. A missing token is added to the theme layer, not inlined here."
fi

# 2. Raw Tailwind palette colours. These look themed and are not: they ignore
#    the CSS variables, so a brand change misses them and dark mode inverts
#    around them.
PALETTE='slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
if printf '%s\n' "$BODY" | grep -qE "\b(bg|text|border|ring|ring-offset|fill|stroke|from|via|to|divide|placeholder|caret|outline|decoration|shadow)-($PALETTE)-(50|[1-9]00|950)\b"; then
  note "Theme: raw Tailwind palette colour in $REL (e.g. bg-slate-900). That bypasses the token layer — it survives a brand change and breaks dark mode. Map it to a semantic token: surfaces bg-background/bg-card/bg-muted, text text-foreground/text-muted-foreground, lines border-border, actions bg-primary/bg-accent, danger bg-destructive."
fi

# 3. A UI or icon library outside the set this repo approved. The list of things
#    recognisable as a UI kit is fixed; which of them is allowed is per repo.
KNOWN_UI_LIBS='@mui @chakra-ui @headlessui @mantine @heroicons @emotion @nextui-org @fortawesome @radix-ui antd bootstrap react-bootstrap react-feather react-icons styled-components primereact semantic-ui-react lucide-react sonner'
for imp in $(printf '%s\n' "$BODY" | grep -oE "(from|require\()\s*['\"][^'\"]+['\"]" | grep -oE "['\"][^'\"]+['\"]" | tr -d "\"'"); do
  pkg="${imp%%/*}"; case "$imp" in @*/*) pkg="${imp%%/*}";; esac
  printf '%s\n' $KNOWN_UI_LIBS | grep -qxF "$pkg" || continue
  printf '%s\n' $APPROVED_UI_LIBS | grep -qxF "$pkg" && continue
  note "Theme: '$pkg' is a UI or icon library this repo has not approved in $REL. Approved here: $APPROVED_UI_LIBS. One kit and one icon set — a missing primitive comes from the approved kit's own CLI. If the kit itself is changing, that is a package.json decision with lead review, and APPROVED_UI_LIBS at the top of this hook changes with it."
done

# 4. Colour in an inline style prop. Layout in a style prop is sometimes
#    unavoidable (a computed width); colour never is.
if printf '%s\n' "$BODY" | grep -qE 'style=\{\{[^}]*(color|background|border|fill|stroke)'; then
  note "Theme: colour in an inline style prop in $REL. Use a token class so partner and client theme overrides reach it — an inline style is invisible to the CSS variable layer."
fi

[ "$FAIL" = "1" ] && {
  echo "Tokens: http://brand-hub.kifiya.et/ · this repo's theme CSS · claude-md-variants/CLAUDE-web-frontend.md" >&2
  echo "Deliberate exception: rerun with KIFIYA_ALLOW_THEME_DRIFT=1." >&2
  exit 2
}
exit 0
