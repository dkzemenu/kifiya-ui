#!/usr/bin/env bash
# PreToolUse on Bash. Blocks obviously destructive commands. Exit 2 = block.
# Text match only: a wrapper script that runs one of these inside passes. This is a guardrail
# against the agent's own commands, not a security boundary; CI permissions and backups are.
INPUT=$(cat)
command -v jq >/dev/null 2>&1 || { echo "guard-bash: jq not found; guard inactive" >&2; exit 0; }
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[ -z "$CMD" ] && exit 0

block() { echo "Blocked: command matches destructive pattern '$1'. If genuinely intended, a human runs it." >&2; exit 2; }

# Substring match (case-insensitive), so 'rm -rf /' also catches 'rm -rf /var/x' — deliberate:
# absolute-path recursive deletes are never the agent's call. Relative ones (rm -rf node_modules) pass.
for b in "rm -rf /" "rm -fr /" "rm -rf ~" "rm -fr ~" "rm -rf *" \
         "DROP TABLE" "DROP DATABASE" "DROP SCHEMA" "TRUNCATE TABLE" \
         "terraform destroy" "kubectl delete ns" "kubectl delete namespace"; do
  if echo "$CMD" | grep -qiF "$b"; then block "$b"; fi
done

# Force push — except --force-with-lease / --force-if-includes, the safe variants.
SAFE=$(echo "$CMD" | sed -E 's/--force-(with-lease|if-includes)(=[^[:space:]]*)?//g')
echo "$SAFE" | grep -qiE 'git push[^|;&]*([[:space:]](--force|-f)([[:space:]]|$)|[[:space:]]\+[A-Za-z])' \
  && block "git push --force / +refspec"

# .env holds secrets; shell redirection would bypass the Edit/Write hooks entirely.
echo "$CMD" | grep -qE '(^|[|;&[:space:]])(>>?[[:space:]]*|tee( -a)?[[:space:]]+)\.env([[:space:]./]|$)' \
  && block "shell write to .env"

exit 0
