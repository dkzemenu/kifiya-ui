#!/usr/bin/env bash
# Self-test for theme-guard.sh, the web frontend hook.
# Builds a throwaway repo, runs the hook with synthetic tool inputs, checks the exit code.
#   scripts/verify-theme-guard.sh              # tests the golden template's hook
#   scripts/verify-theme-guard.sh /path/repo   # tests the hook copied into that repo
# Core hooks: scripts/verify-guards.sh. Mobile hooks: scripts/verify-mobile-guards.sh.
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${1:-$HERE}"
SRC="$REPO/.claude/hooks/theme-guard.sh"
[ -f "$SRC" ] || { echo "no theme-guard.sh under $REPO/.claude/hooks" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is required by the hooks" >&2; exit 1; }

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
export CLAUDE_PROJECT_DIR="$TMP"; unset KIFIYA_ALLOW_THEME_DRIFT
mkdir -p "$TMP/client/src/lib" "$TMP/client/src/theme" "$TMP/src" "$TMP/server"

# As shipped: GUARDED_ROOTS empty. Configured: roots set, the way an adopter fills it in.
SHIPPED="$TMP/hook-shipped.sh"; cp "$SRC" "$SHIPPED"
CONF="$TMP/hook-configured.sh"
sed -E 's|^GUARDED_ROOTS=.*|GUARDED_ROOTS="client/src/"|' "$SRC" > "$CONF"
MUI="$TMP/hook-mui.sh"
sed -E -e 's|^GUARDED_ROOTS=.*|GUARDED_ROOTS="client/src/"|' \
       -e 's|^APPROVED_UI_LIBS=.*|APPROVED_UI_LIBS="@mui @emotion"|' "$SRC" > "$MUI"

pass=0; fail=0
expect() { # expect <want-exit> <hook> <relpath> <content> <label>
  local want="$1" hook="$2" rel="$3" content="$4" label="$5" got
  mkdir -p "$(dirname "$TMP/$rel")"; printf '%s\n' "$content" > "$TMP/$rel"
  jq -cn --arg f "$TMP/$rel" '{tool_input:{file_path:$f}}' | bash "$hook" >/dev/null 2>"$TMP/err"; got=$?
  if [ "$got" = "$want" ]; then pass=$((pass+1)); printf 'PASS  %-58s exit %s\n' "$label" "$got"
  else fail=$((fail+1)); printf 'FAIL  %-58s exit %s (wanted %s)\n' "$label" "$got" "$want"; sed 's/^/        /' "$TMP/err"; fi
}

echo "-- opt-in: as shipped, GUARDED_ROOTS is empty and the hook is inert"
expect 0 "$SHIPPED" client/src/a.css 'a { color: #02404F; }'        'unset roots: real violation still allowed'

echo
echo "-- not colours, must not block (a blocking hook runs on every edit)"
expect 0 "$CONF" client/src/id.css   '#cafe { display: none }'                        'CSS id selector #cafe'
expect 0 "$CONF" client/src/u.ts     'const u = "https://docs/guide#a1b2c3"'          'URL fragment'
expect 0 "$CONF" client/src/c.ts     '// fixed in commit #deadbeef'                   'sha in a comment'
expect 0 "$CONF" client/src/i.ts     'const id = "#123abc"'                           'opaque id string'
expect 0 "$CONF" client/src/ok.tsx   'export const X = () => <b className="bg-primary text-muted-foreground" />' 'semantic tokens only'

echo
echo "-- real drift, must block"
expect 2 "$CONF" client/src/v1.css   'a { color: #02404F; }'                          'hex in a CSS colour property'
expect 2 "$CONF" client/src/v2.css   'a { border: 1px solid #ccc; }'                  'hex after an intervening value'
expect 2 "$CONF" client/src/v3.tsx   'export const X = () => <b className="bg-[#EB7D23]" />' 'tailwind arbitrary colour'
expect 2 "$CONF" client/src/v4.tsx   'export const X = () => <b className="bg-red-500" />'   'raw tailwind palette'
expect 2 "$CONF" client/src/v5.tsx   'export const X = () => <b style={{color:"#EB7D23"}} />' 'colour in inline style'
expect 2 "$CONF" client/src/v6.css   'a { background: rgb(12,34,56); }'               'rgb() call'
expect 2 "$CONF" client/src/v7.tsx   'import { Button } from "@mui/material"'         'unapproved UI kit'

echo
echo "-- approved kit is per repo, not per company"
expect 0 "$CONF" client/src/k1.tsx   'import * as D from "@radix-ui/react-dialog"'    'shadcn default: @radix-ui allowed'
expect 0 "$CONF" client/src/k2.tsx   'import { Home } from "lucide-react"'            'shadcn default: lucide allowed'
expect 0 "$MUI"  client/src/k3.tsx   'import { Button } from "@mui/material"'         'MUI repo: @mui allowed'
expect 2 "$MUI"  client/src/k4.tsx   'import { Home } from "lucide-react"'            'MUI repo: lucide now blocked'

echo
echo "-- scope and exemptions"
expect 0 "$CONF" src/out.css         'a { color: #02404F; }'                          'outside GUARDED_ROOTS'
expect 0 "$CONF" server/app.py       'BRAND = "#02404F"'                              'non view-layer extension'
expect 0 "$CONF" client/src/theme/kifiya-theme.css ':root { --primary: #02404F; }'    'theme layer exempt'
expect 0 "$CONF" client/src/x.test.tsx 'it("is #EB7D23", () => {})'                   'test file exempt'
printf 'client/src/lib/avatar\n' > "$TMP/theme-exempt-paths.txt"
expect 2 "$CONF" client/src/lib/avatarGenerator2.ts 'const c = { color: "#EB7D23" }'  'exempt entry is not a bare prefix'
printf 'client/src/lib/avatarGenerator2.ts\n' > "$TMP/theme-exempt-paths.txt"
expect 0 "$CONF" client/src/lib/avatarGenerator2.ts 'const c = { color: "#EB7D23" }'  'exempt entry matches exactly'
: > "$TMP/theme-exempt-paths.txt"

echo
echo "-- operator override"
KIFIYA_ALLOW_THEME_DRIFT=1 expect 0 "$CONF" client/src/o.css 'a { color: #02404F; }'  'KIFIYA_ALLOW_THEME_DRIFT=1'

echo
echo "$pass passed, $fail failed"
[ "$fail" = "0" ]
