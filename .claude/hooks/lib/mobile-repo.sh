#!/usr/bin/env bash
# Sourced by the mobile hooks. is_mobile_repo returns 0 when the project looks like a mobile app,
# so the mobile hooks are a no-op in backend and data repos and one settings.json serves every repo.
# Force with KIFIYA_MOBILE_REPO=1 (treat as mobile) or =0 (never mobile).
kifiya_root() { echo "${CLAUDE_PROJECT_DIR:-$PWD}"; }
is_mobile_repo() {
  local r; r="$(kifiya_root)"
  [ "$KIFIYA_MOBILE_REPO" = "1" ] && return 0
  [ "$KIFIYA_MOBILE_REPO" = "0" ] && return 1
  [ -f "$r/pubspec.yaml" ] && return 0                                   # Flutter
  { [ -d "$r/android" ] && [ -d "$r/ios" ]; } && return 0                 # Flutter / RN / Ionic layout
  { [ -f "$r/package.json" ] && grep -qE '"(react-native|expo)"' "$r/package.json" 2>/dev/null; } && return 0
  ls -d "$r"/*.xcodeproj "$r"/*.xcworkspace "$r"/ios/*.xcodeproj >/dev/null 2>&1 && return 0   # native iOS
  { [ -f "$r/app/build.gradle" ] || [ -f "$r/app/build.gradle.kts" ]; } && return 0           # native Android
  return 1
}
