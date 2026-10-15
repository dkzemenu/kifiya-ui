#!/usr/bin/env bash
# Self-test for the core hook set (protect-paths, guard-bash, scan-and-format), any repo type.
# Builds a throwaway repo, runs each hook with synthetic tool inputs, checks the exit code.
#   scripts/verify-guards.sh              # tests the golden template's hooks + its protected-paths.txt
#   scripts/verify-guards.sh /path/repo   # tests the hooks copied into that repo against ITS protected-paths.txt;
#                                         # protected-path cases for entries the repo trimmed are reported as SKIP
# Mobile repos also run scripts/verify-mobile-guards.sh for the mobile hook set.
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${1:-$HERE}"
HOOKS="$REPO/.claude/hooks"
[ -x "$HOOKS/protect-paths.sh" ] || { echo "no executable hooks under $HOOKS (chmod +x .claude/hooks/*.sh?)" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is required by the hooks" >&2; exit 1; }

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
export CLAUDE_PROJECT_DIR="$TMP"; unset KIFIYA_ALLOW_PROTECTED KIFIYA_MOBILE_REPO
cp "$REPO/protected-paths.txt" "$TMP/protected-paths.txt" 2>/dev/null || : > "$TMP/protected-paths.txt"
mkdir -p "$TMP/lib"

pass=0; fail=0; skip=0
expect() { # expect <want-exit> <hook> <json> <label>
  local want="$1" hook="$2" json="$3" label="$4" got
  printf '%s' "$json" | bash "$HOOKS/$hook" >/dev/null 2>"$TMP/err"; got=$?
  if [ "$got" = "$want" ]; then pass=$((pass+1)); printf 'PASS  %-66s exit %s\n' "$label" "$got"
  else fail=$((fail+1)); printf 'FAIL  %-66s exit %s (wanted %s)\n' "$label" "$got" "$want"; sed 's/^/        /' "$TMP/err"; fi
}
bash_json() { jq -cn --arg c "$1" '{tool_input:{command:$c}}'; }
file_json() { jq -cn --arg f "$1" '{tool_input:{file_path:$f}}'; }
write_file() { mkdir -p "$(dirname "$TMP/$1")"; printf '%s\n' "$2" > "$TMP/$1"; file_json "$TMP/$1"; }
protected() { # protected <list-entry> <file> <label>: expect a block if the entry is in the list under test, else SKIP
  if grep -qxF "$1" "$TMP/protected-paths.txt"; then expect 2 protect-paths.sh "$(file_json "$TMP/$2")" "$3"
  else skip=$((skip+1)); printf 'SKIP  %-66s (%s not in protected-paths.txt)\n' "$3" "$1"; fi
}

echo "== protect-paths.sh (PreToolUse Edit|Write)"
protected "payments/"           "payments/handler.go"       "payments/ protected"
protected "auth/"               "auth/login.ts"             "auth/ protected"
protected "migrations/"         "migrations/0001_init.sql"  "migrations/ protected"
protected ".claude/"            ".claude/settings.json"     ".claude/ protected (the guards protect themselves)"
protected "CLAUDE.md"           "CLAUDE.md"                 "CLAUDE.md protected"
protected "protected-paths.txt" "protected-paths.txt"       "protected-paths.txt itself protected"
expect 0 protect-paths.sh "$(file_json "$TMP/lib/service.py")"          "unprotected file allowed"
printf '# a comment line\n\ntmp-guarded/\n' >> "$TMP/protected-paths.txt"
expect 2 protect-paths.sh "$(file_json "$TMP/tmp-guarded/x.go")"        "entry after comment and blank lines still matches"
expect 0 protect-paths.sh "$(file_json "$TMP/a-comment-line-lookalike")" "comment lines are not treated as prefixes"
KIFIYA_ALLOW_PROTECTED=1 expect 0 protect-paths.sh "$(file_json "$TMP/tmp-guarded/x.go")" "override KIFIYA_ALLOW_PROTECTED=1 allows the edit"

echo "== guard-bash.sh (PreToolUse Bash)"
expect 2 guard-bash.sh "$(bash_json 'rm -rf /var/lib/data')"                        "rm -rf on an absolute path blocked"
expect 2 guard-bash.sh "$(bash_json 'rm -rf ~')"                                    "rm -rf ~ blocked"
expect 0 guard-bash.sh "$(bash_json 'rm -rf node_modules dist')"                    "rm -rf on relative dirs allowed"
expect 2 guard-bash.sh "$(bash_json 'psql -c "DROP TABLE users"')"                  "DROP TABLE blocked"
expect 2 guard-bash.sh "$(bash_json 'psql -c "truncate table ledger_entries"')"     "TRUNCATE TABLE blocked (case-insensitive)"
expect 2 guard-bash.sh "$(bash_json 'terraform destroy -auto-approve')"             "terraform destroy blocked"
expect 2 guard-bash.sh "$(bash_json 'kubectl delete namespace payments')"           "kubectl delete namespace blocked"
expect 2 guard-bash.sh "$(bash_json 'git push --force origin main')"                "git push --force blocked"
expect 2 guard-bash.sh "$(bash_json 'git push -f')"                                 "git push -f blocked"
expect 2 guard-bash.sh "$(bash_json 'git push origin +main')"                       "git push +refspec (force by refspec) blocked"
expect 0 guard-bash.sh "$(bash_json 'git push --force-with-lease origin feature')"  "git push --force-with-lease allowed (the safe variant)"
expect 0 guard-bash.sh "$(bash_json 'git push origin feature-branch')"              "plain git push allowed"
expect 2 guard-bash.sh "$(bash_json 'echo "TOKEN=x" > .env')"                       "shell redirect into .env blocked"
expect 2 guard-bash.sh "$(bash_json 'cat creds | tee .env.local')"                  "tee into .env.local blocked"
expect 0 guard-bash.sh "$(bash_json 'cp .env.example docs/env-vars.md')"            "copying .env.example (no redirect) allowed"
expect 0 guard-bash.sh "$(bash_json 'go test ./... && git status')"                 "ordinary command allowed"

echo "== scan-and-format.sh (PostToolUse Edit|Write)"
expect 2 scan-and-format.sh "$(write_file src/cfg.py 'api_key = "abcdefghijklmnop1234"')"  "quoted secret caught"
expect 2 scan-and-format.sh "$(write_file notes/k.txt '-----BEGIN PRIVATE KEY-----')"      "private key header caught"
expect 0 scan-and-format.sh "$(write_file src/ok.py 'def main() -> None: ...')"            "clean file passes"

echo; echo "$pass passed, $fail failed, $skip skipped"
[ "$fail" = "0" ]
