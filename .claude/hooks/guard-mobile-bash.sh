#!/usr/bin/env bash
# PreToolUse on Bash, mobile repos only. Blocks release builds, prod-flavor runs, store uploads,
# and signing-material commands. Release builds are CI's job, triggered by a human (policy 4.3).
# Exit 2 = block. Override for a knowing operator: KIFIYA_ALLOW_RELEASE=1.
# Matches command text only: a wrapper script that calls 'flutter build apk' inside passes. This is a
# guardrail against the agent's own commands, not a security boundary; CI and store access are.
. "$(dirname "$0")/lib/mobile-repo.sh"
is_mobile_repo || exit 0
INPUT=$(cat)
command -v jq >/dev/null 2>&1 || { echo "guard-mobile-bash: jq not found; guard inactive" >&2; exit 0; }
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[ -z "$CMD" ] && exit 0
[ "$KIFIYA_ALLOW_RELEASE" = "1" ] && exit 0

block() { echo "Blocked ($1): $2. Release and signing steps run in CI, triggered by a human. If genuinely intended, the operator reruns with KIFIYA_ALLOW_RELEASE=1." >&2; exit 2; }

# Prod flavor / prod environment on a laptop, any framework. Flavor names assumed: dev / staging / prod;
# anything starting with prod (prodRelease, prod_internal), production, prd, live, release counts as prod.
# Covered switches: --flavor, -t/--target lib/main_<flavor>.dart, --dart-define ENV=, --dart-define-from-file,
# -scheme/-configuration. Repos with other flavor names extend this line (CLAUDE.md documents the assumption).
PROD='(prod[A-Za-z_-]*|production|prd|live|release)\b'
echo "$CMD" | grep -qiE -- "--flavor[= ]+\"?${PROD}|--dart-define[= ]+\"?[A-Z_]*(ENV|FLAVOR|ENVIRONMENT)=${PROD}|--dart-define-from-file[= ]+\"?([^[:space:]]*[/_.-])?prod(uction)?([._-]|[[:space:]]|\$)|-{1,2}(scheme|configuration)[= ]+\"?${PROD}|(^|[[:space:]])(-t|--target)[= ]+\"?[^[:space:]]*main_${PROD}" \
  && block "prod flavor" "the command targets the prod flavor or environment; agents run dev only"

# Flutter: build apk/appbundle/ipa default to release mode unless --debug or --profile is given
echo "$CMD" | grep -qiE '\bflutter\s+build\s+(apk|appbundle|aar|ipa|ios|ios-framework|macos)\b' \
  && ! echo "$CMD" | grep -qiE -- '--(debug|profile)\b' \
  && block "release build" "'flutter build' without --debug or --profile produces a release artifact"

# Gradle release / prod variants (assembleRelease, bundleProdRelease, :app:assembleRelease ...)
echo "$CMD" | grep -qiE 'gradlew?\b[^|;&]*\b(assemble|bundle|publish|install)[A-Za-z]*(Release|Prod)' \
  && block "release build" "Gradle release/prod variant"

# Xcode archive / export
echo "$CMD" | grep -qiE '\bxcodebuild\b[^|;&]*\b(archive|-exportArchive)\b' \
  && block "release build" "xcodebuild archive/export"

# fastlane lanes and actions that build for release, fetch signing, or upload to stores.
# 'match' is blocked for every type, including 'match development': it fetches signing material either way.
echo "$CMD" | grep -qiE '\bfastlane\b[^|;&]*\b(release|deploy|beta|production|prod|supply|pilot|deliver|match|gym|sigh|cert|upload_to_(play_store|testflight|app_store))\b' \
  && block "store/signing" "fastlane release, signing, or upload lane"

# Expo / EAS: eas build defaults to the production profile; eas submit always uploads
echo "$CMD" | grep -qiE '\beas\s+build\b' \
  && ! echo "$CMD" | grep -qiE -- '--profile[= ]+"?(dev|development|preview|staging)\b' \
  && block "release build" "'eas build' without a dev/preview profile builds for production"
echo "$CMD" | grep -qiE '\beas\s+submit\b|\beas\s+update\b[^|;&]*--branch[= ]+"?(prod|production)\b|\bexpo\s+publish\b' \
  && block "store upload" "EAS submit / production update"

# Direct store and distribution uploads
echo "$CMD" | grep -qiE '\bxcrun\s+(altool\s+--upload-app|notarytool\s+submit)\b|\bfirebase\s+appdistribution:distribute\b|\bgradlew?\b[^|;&]*\bpublish(Bundle|Apk|Release)' \
  && block "store upload" "direct upload to a store or distribution service"

# Signing material: generating, importing, exporting keystores, certs, provisioning profiles
echo "$CMD" | grep -qiE '\bkeytool\s+-(genkey|genkeypair|importkeystore|exportcert|importcert)\b|\bopenssl\s+pkcs12\b|\bsecurity\s+(import|create-keychain|delete-keychain|set-key-partition-list)\b' \
  && block "signing material" "the command creates, imports, or exports signing keys or certificates"

exit 0
