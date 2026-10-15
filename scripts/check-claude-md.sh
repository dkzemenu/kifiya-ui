#!/usr/bin/env bash
# Enforces the template's Claude Code hygiene budgets. Exit 1 on any failure.
#   scripts/check-claude-md.sh            # checks this repo
#   scripts/check-claude-md.sh /path/repo # checks an adopting repo
# Budgets (see README "Maintaining the template"; grounded in code.claude.com/docs/en/memory):
#   CLAUDE.md <= MAX_CLAUDE_LINES lines; always-loaded set (CLAUDE.md + @imports + unconditional
#   rules) reported against MAX_ALWAYS_TOKENS as an advisory guide (never a failure — 31 Aug
#   fast-lane decision); each variant <= MAX_VARIANT_LINES; unconditional rule <= MAX_RULE_LINES.
#   No bare TODO in CLAUDE.md / PRODUCT.md / variants (use <placeholder>). Every @import resolves.
#   No secret-shaped strings. Path-scoped rules have at least one pattern.
set -u
REPO="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO" || { echo "no such repo: $REPO" >&2; exit 1; }

MAX_CLAUDE_LINES=${MAX_CLAUDE_LINES:-100}
MAX_ALWAYS_TOKENS=${MAX_ALWAYS_TOKENS:-6000}
MAX_VARIANT_LINES=${MAX_VARIANT_LINES:-240}  # golden mobile variant is 201 lines empty; a filled §1 needs headroom
MAX_RULE_LINES=${MAX_RULE_LINES:-40}

pass=0; fail=0
ok()   { pass=$((pass+1)); printf 'PASS  %s\n' "$1"; }
bad()  { fail=$((fail+1)); printf 'FAIL  %s\n' "$1"; }
tokens() { echo $(( $(wc -c < "$1") / 4 )); }   # bytes/4: the same rough estimate the docs use
has_paths() { awk 'NR==1&&$0!="---"{exit 1} /^---$/{c++; if(c==2)exit} c==1&&/^paths:/{f=1} END{exit !f}' "$1"; }

[ -f CLAUDE.md ] || { bad "CLAUDE.md missing"; echo "$pass passed, $fail failed"; exit 1; }

# 1. CLAUDE.md line budget
n=$(wc -l < CLAUDE.md | tr -d ' ')
[ "$n" -le "$MAX_CLAUDE_LINES" ] && ok "CLAUDE.md is $n lines (<= $MAX_CLAUDE_LINES)" || bad "CLAUDE.md is $n lines (> $MAX_CLAUDE_LINES)"

# 2. @imports resolve (outside code spans/blocks, relative to the importing file, <= 4 hops)
imports_of() { # file -> resolved import paths, one per line
  local f="$1" dir; dir=$(dirname "$f")
  # mirror the loader: drop HTML comments, fenced blocks and code spans before looking for @path
  perl -0pe 's/<!--.*?-->//gs' "$f" | awk '/^```/{c=!c} !c' | sed 's/`[^`]*`//g' | grep -oE '(^|[[:space:]])@[^[:space:]]+' | sed -E 's/^[[:space:]]*@//' \
    | while IFS= read -r p; do case "$p" in /*|~*) echo "$p";; *) echo "$dir/$p";; esac; done
}
always=("CLAUDE.md"); queue=("CLAUDE.md"); depth=0; missing=0
while [ ${#queue[@]} -gt 0 ] && [ $depth -lt 4 ]; do
  next=()
  for f in "${queue[@]}"; do
    while IFS= read -r imp; do
      [ -z "$imp" ] && continue
      if [ -f "$imp" ]; then always+=("$imp"); next+=("$imp"); else bad "import @$imp (from $f) does not resolve"; missing=$((missing+1)); fi
    done < <(imports_of "$f")
  done
  queue=("${next[@]+"${next[@]}"}"); depth=$((depth+1))  # empty-array + set -u is fatal on bash 3.2 (macOS default)
done
[ $missing -eq 0 ] && ok "all @imports resolve (${#always[@]} files in the import tree)"

# 3. unconditional rules: size, and add to the always-loaded set
if [ -d .claude/rules ]; then
  while IFS= read -r r; do
    if has_paths "$r"; then
      grep -qE '^[[:space:]]*-[[:space:]]*"?[^"[:space:]]' <(awk '/^---$/{c++; next} c==1' "$r" | sed -n '/^paths:/,/^[a-z_]*:/p') \
        && ok "$r is path-scoped" || bad "$r has 'paths:' but no patterns"
    else
      always+=("$r"); rl=$(wc -l < "$r" | tr -d ' ')
      [ "$rl" -le "$MAX_RULE_LINES" ] && ok "$r always-loaded, $rl lines (<= $MAX_RULE_LINES)" || bad "$r always-loaded, $rl lines (> $MAX_RULE_LINES)"
    fi
  done < <(find .claude/rules -name '*.md' | sort)
fi

# 3b. agents present (adoption copies .claude/agents/; losing them is a silent capability drop)
if ls .claude/agents/*.md >/dev/null 2>&1; then ok ".claude/agents/ has $(ls .claude/agents/*.md | wc -l | tr -d ' ') agent(s)"; else bad ".claude/agents/ missing or empty"; fi

# 4. always-loaded size — advisory since the 31 Aug fast-lane decision: there is
# no token budget (seats are monthly subscription). The number stays in the report
# because a bloated always-on set still dulls every session (the 4,000-line
# CLAUDE.md failure mode); MAX_ALWAYS_TOKENS only marks where the nudge starts.
tot=0; for f in "${always[@]}"; do tot=$((tot + $(tokens "$f"))); done
if [ "$tot" -le "$MAX_ALWAYS_TOKENS" ]; then
  ok "always-loaded set ~$tot tokens (<= $MAX_ALWAYS_TOKENS guide): ${always[*]}"
else
  # still a pass (the guide never fails), but labelled NOTE so adoption
  # handover reports can grep it: grep '^NOTE' catches over-guide repos
  pass=$((pass+1)); printf 'NOTE  %s\n' "always-loaded set ~$tot tokens (over the $MAX_ALWAYS_TOKENS guide; advisory only — trim when convenient): ${always[*]}"
fi

# 5. variants: line budget and no bare TODO
for v in claude-md-variants/*.md; do
  [ -f "$v" ] || continue
  vl=$(wc -l < "$v" | tr -d ' ')
  [ "$vl" -le "$MAX_VARIANT_LINES" ] && ok "$v is $vl lines (<= $MAX_VARIANT_LINES)" || bad "$v is $vl lines (> $MAX_VARIANT_LINES)"
done

# 6. bare TODO anywhere it should be a blocker (<TODO: …> or <placeholder>)
for f in CLAUDE.md PRODUCT.md claude-md-variants/*.md; do
  [ -f "$f" ] || continue
  c=$(sed -E 's/<TODO:[^>]*>//g' "$f" | grep -cw 'TODO' || true)
  [ "$c" -eq 0 ] && ok "$f has no bare TODO" || bad "$f has $c bare TODO(s); write them as <TODO: …> so Claude reports them as blockers"
done

# 7. wiring: JSON files Claude Code parses are valid; hooks are executable; protected paths are prefixes
if command -v jq >/dev/null 2>&1; then
  for j in .mcp.json .claude/settings.json; do
    [ -f "$j" ] || continue
    jq empty "$j" >/dev/null 2>&1 && ok "$j is valid JSON" || bad "$j is not valid JSON"
  done
fi
if [ -d .claude/hooks ]; then
  ne=$(find .claude/hooks -name '*.sh' ! -perm -u+x | wc -l | tr -d ' ')
  [ "$ne" -eq 0 ] && ok "all hook scripts are executable" || bad "$ne hook script(s) not executable (chmod +x .claude/hooks/*.sh .claude/hooks/lib/*.sh)"
fi
if [ -f protected-paths.txt ]; then
  g=$(grep -v '^#' protected-paths.txt | grep -c '[*?]' || true)
  [ "$g" -eq 0 ] && ok "protected-paths.txt entries are prefixes (no globs)" || bad "protected-paths.txt has $g glob-looking entries; the hook matches prefixes, a glob never matches anything"
fi

# 8. nothing git-ignores the harness: a repo .gitignore or a user-global excludes
# file (core.excludesFile) that ignores these files leaves green checks whose
# files can never be committed — the adoption looks done and silently is not
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  # plain check-ignore lists only paths that end up ignored; -v would also list
  # negation matches, so it is used only to explain a failure
  ign=$(git check-ignore CLAUDE.md .mcp.json .claude/settings.json .claude/golden-ref 2>/dev/null || true)
  if [ -z "$ign" ]; then
    ok "no harness file is git-ignored"
  else
    det=$(git check-ignore -v $ign 2>/dev/null || true)
    bad "harness file(s) git-ignored — commits will silently omit them; fix the source shown: ${det:-$ign}"
  fi
fi

# 9. secret-shaped strings in anything Claude loads
if grep -rnE '(AKIA[0-9A-Z]{16}|glpat-[A-Za-z0-9_\-]{20}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(api[_-]?key|secret|password|token)[[:space:]]*[=:][[:space:]]*["'\''][A-Za-z0-9_\-]{16,}["'\''])' CLAUDE.md PRODUCT.md DECISIONS.md .claude/rules claude-md-variants 2>/dev/null; then
  bad "secret-shaped string found (see above)"
else
  ok "no secret-shaped strings in loaded files"
fi

echo; echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
