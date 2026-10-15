#!/usr/bin/env bash
# PostToolUse on Edit|Write, mobile repos only. Content checks after the write:
# mobile secrets, insecure transport config, certificate-validation bypasses, tokens in insecure
# storage, PII in log calls. Exit 2 = the finding is fed back to Claude to fix before moving on.
# These complement scan-and-format.sh (generic secrets) and are heuristics: a false positive is a
# one-line explanation in the PR, not a reason to disable the hook.
. "$(dirname "$0")/lib/mobile-repo.sh"
is_mobile_repo || exit 0
INPUT=$(cat)
command -v jq >/dev/null 2>&1 || exit 0   # scanner is best-effort; CI is the real gate
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
{ [ -z "$FILE" ] || [ ! -f "$FILE" ]; } && exit 0
case "$FILE" in *.png|*.jpg|*.jpeg|*.gif|*.webp|*.ttf|*.otf|*.zip|*.jar|*.aar|*.lock) exit 0;; esac
# The hook set and its self-test contain every pattern below by construction; scanning them would
# block whoever tunes a regex. protect-paths.sh guards .claude/ separately.
REL="${FILE#"$(kifiya_root)"/}"
case "$REL" in .claude/hooks/*|scripts/verify-*) exit 0;; esac
grep -qI . "$FILE" 2>/dev/null || exit 0   # binary: nothing to scan
FAIL=0
hit() { echo "scan-mobile: $1 in $FILE" >&2; echo "$2" | sed 's/^/    /' >&2; FAIL=1; }

# 1. Mobile secrets the generic quoted-secret regex misses (Gradle properties, fastlane env, EAS).
#    Separator is '=', ':' or whitespace (Groovy DSL: storePassword "..."). Values read from the
#    environment or from Gradle/keystore properties are the correct pattern and pass. Only line numbers
#    are reported: the value itself must not be echoed into logs.
M=$(grep -nE '^[[:space:]]*(storePassword|keyPassword|MATCH_PASSWORD|FASTLANE_PASSWORD|FASTLANE_SESSION|APP_STORE_CONNECT_API_KEY(_KEY)?|SUPPLY_JSON_KEY_DATA|EXPO_TOKEN|FIREBASE_TOKEN|ANDROID_KEYSTORE_PASSWORD)([[:space:]]*[=:]|[[:space:]]+)[[:space:]]*["'\'']?[^[:space:]$"'\''][^[:space:]"'\'']{3,}' "$FILE" \
  | grep -vE 'System\.getenv|keystoreProperties|signingProperties|localProperties|providers\.|project\.(property|findProperty|hasProperty)|rootProject\.|getProperty\(|gradle(Local)?Properties|ENV\[|os\.environ|process\.env|<[A-Z_]+>|TODO')
[ -n "$M" ] && hit "signing/store credential written in plain text (load it from the CI secret store instead)" "line(s): $(echo "$M" | cut -d: -f1 | tr '\n' ' ')"

# 2. Insecure transport: cleartext HTTP, arbitrary loads, debuggable/backup flags in manifests and plists
M=$(grep -nE 'cleartextTrafficPermitted="true"|android:usesCleartextTraffic="true"|android:debuggable="true"|android:allowBackup="true"' "$FILE")
[ -n "$M" ] && hit "insecure Android config (cleartext traffic, debuggable, or allowBackup on; fintech baseline is off)" "$M"
if grep -qE 'NSAllowsArbitraryLoads|NSExceptionAllowsInsecureHTTPLoads|NSAllowsArbitraryLoadsInWebContent' "$FILE"; then
  M=$(grep -nE -A1 'NSAllowsArbitraryLoads|NSExceptionAllowsInsecureHTTPLoads' "$FILE" | grep -E '<true/?>' )
  [ -n "$M" ] && hit "App Transport Security disabled (NSAllowsArbitraryLoads / insecure HTTP loads = true)" "$M"
fi

# 3. Certificate-validation and pinning bypasses
M=$(grep -nE 'badCertificateCallback[[:space:]]*=|TrustAllCerts|trustAllCerts|ALLOW_ALL_HOSTNAME_VERIFIER|allowAllHostnameVerifier|NSURLAuthenticationMethodServerTrust.*useCredential|disableCertificatePinning|pinning[[:space:]]*[:=][[:space:]]*(false|off)' "$FILE")
[ -n "$M" ] && hit "certificate validation or pinning bypass (pinning stays on for staging and prod)" "$M"
# Empty checkServerTrusted body, single- or multi-line: join lines first, so no line number here.
M=$(tr '\n' ' ' < "$FILE" | grep -oE 'checkServerTrusted[^{}]*\{[[:space:]]*\}' | head -1)
[ -n "$M" ] && hit "empty checkServerTrusted body (trust-all TrustManager)" "$M"

# 4. Credentials in insecure storage (Keychain / Android Keystore / flutter_secure_storage only)
M=$(grep -niE '(SharedPreferences|getSharedPreferences|AsyncStorage|UserDefaults|NSUserDefaults|localStorage|MMKV)[^;]*(token|refresh|pin\b|password|secret|session|otp|jwt)' "$FILE")
[ -n "$M" ] && hit "credential-looking value in insecure storage (use Keychain / Keystore / flutter_secure_storage)" "$M"

# 5. PII in log calls (policy 2.1: logs and crash reports carry no customer identifiers).
#    The identifier must be a value, not a word in a string literal: interpolated ($phone, ${user.phone}),
#    concatenated (+ phone), passed (Log.d(TAG, phone)) or accessed (user.phone). "phone verification
#    screen opened" is a UI string and passes.
LOGCALL='\b(print|debugPrint|console\.(log|debug|info|warn|error)|Log\.[dievw]|Timber\.[dievw]|log\.(trace|debug|info|warn|error)|NSLog|os_log|Logger\.[a-z]+|Crashlytics[^;]*log|Sentry[^;]*(captureMessage|addBreadcrumb))[[:space:]]*\('
VALUE='(\$\{?|[.(,+][[:space:]]*)[A-Za-z_.]*'
PII='(phone|msisdn|accountNumber|account_number|walletId|wallet_id|nationalId|national_id|\bpan|cvv|cardNumber|card_number|otp|pin)(Number|Num|No|Id|Code|Value|_number|_id|_code)?\b'
M=$(grep -niE "${LOGCALL}[^)]*${VALUE}${PII}" "$FILE")
[ -n "$M" ] && hit "customer identifier in a log or crash-reporter call" "$M"

[ "$FAIL" = "1" ] && { echo "Fix the lines above or, if this is a false positive, say so in the PR description." >&2; exit 2; }
exit 0
