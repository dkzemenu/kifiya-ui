#!/usr/bin/env bash
# PreToolUse on Edit|Write, mobile repos only. Refuses to write signing material and
# store credentials anywhere in the tree, whatever protected-paths.txt says. Exit 2 = block.
# Same override as protected paths: KIFIYA_ALLOW_PROTECTED=1.
. "$(dirname "$0")/lib/mobile-repo.sh"
is_mobile_repo || exit 0
INPUT=$(cat)
command -v jq >/dev/null 2>&1 || { echo "guard-mobile-files: jq not found; guard inactive" >&2; exit 0; }
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] && exit 0
[ "$KIFIYA_ALLOW_PROTECTED" = "1" ] && exit 0
BASE=$(basename "$FILE" | tr '[:upper:]' '[:lower:]')   # case-insensitive: Upload.JKS is still a keystore
case "$BASE" in
  *.keystore|*.jks|*.p12|*.pfx|*.mobileprovision|*.provisionprofile|*.p8|*.cer.enc|*.p12.enc)
    echo "Blocked: '$BASE' is signing material (keystore, certificate, provisioning profile, or APNs key). It never lives in this repo; CI holds it. Propose the change instead, or the operator reruns with KIFIYA_ALLOW_PROTECTED=1." >&2; exit 2;;
  key.properties|keystore.properties|signing.properties|*service-account*.json|*service_account*.json|*play-store*.json|*playstore*.json|authkey_*.p8|appfile.local)
    echo "Blocked: '$BASE' holds signing or store credentials. It is CI-only material; load it from the CI secret store, never from the repo. Override: KIFIYA_ALLOW_PROTECTED=1." >&2; exit 2;;
esac
exit 0
