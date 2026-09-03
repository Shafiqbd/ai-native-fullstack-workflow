#!/usr/bin/env bash
#
# Verification harness for ai-native-fullstack-workflow.
#
# Runs every deterministic quality gate and prints a clear PASS/FAIL
# summary. Agents (and humans) must treat this as the single source of
# truth for "is this task done": an implementation is only complete
# when this script exits 0.
#
# Usage:
#   yarn verify          (from the repository root)

set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

# ------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------
# Each entry is "Title|command". A step failing does not stop the run:
# we collect every failure so a single verify pass reports all broken
# gates at once.
STEPS=(
  "Build shared packages|yarn build:packages"
  "TypeScript type-check|yarn type-check"
  "ESLint|yarn lint"
  "Unit tests|yarn test"
  "E2E tests|yarn test:e2e"
  "Production build|yarn build"
)

GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

declare -a RESULTS=()
FAILURES=0

# ------------------------------------------------------------------
# Run all steps
# ------------------------------------------------------------------
for entry in "${STEPS[@]}"; do
  title="${entry%%|*}"
  command="${entry#*|}"

  printf '\n%b\n' "${BOLD}==> ${title}${RESET}"
  printf '%b\n' "    \$ ${command}"

  log_file=$(mktemp)
  if bash -c "${command}" >"${log_file}" 2>&1; then
    RESULTS+=("PASS  ${title}")
    printf '%b\n' "${GREEN}    [PASS]${RESET}"
  else
    status=$?
    RESULTS+=("FAIL  ${title}")
    FAILURES=$((FAILURES + 1))
    printf '%b\n' "${RED}    [FAIL] (exit code ${status})${RESET}"
    # Show the tail of the failed step output to make failures
    # actionable without re-running anything.
    tail -n 40 "${log_file}" | sed 's/^/    | /'
  fi
  rm -f "${log_file}"
done

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
printf '\n%b\n' "${BOLD}=====================================================${RESET}"
printf '%b\n' "${BOLD} VERIFICATION SUMMARY${RESET}"
printf '%b\n' "${BOLD}=====================================================${RESET}"
for line in "${RESULTS[@]}"; do
  if [[ "${line}" == PASS* ]]; then
    printf '%b\n' "  ${GREEN}${line}${RESET}"
  else
    printf '%b\n' "  ${RED}${line}${RESET}"
  fi
done
printf '%b\n' "${BOLD}=====================================================${RESET}"

if [[ "${FAILURES}" -gt 0 ]]; then
  printf '%b\n' " ${RED}VERIFICATION: FAILED (${FAILURES} gate(s) failing)${RESET}"
  exit 1
fi

printf '%b\n' " ${GREEN}VERIFICATION: PASSED (all gates green)${RESET}"
exit 0
