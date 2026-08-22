#!/bin/bash
#
# Safety App — Generate a signing keystore for Google Play
#
# Run this ONCE on your local machine before building the release.
# Requires Java JDK 17+ (bundled with Android Studio).
#
# Usage:
#   ./gen-safety-keystore.sh [options]
#
# Options:
#   -o, --output <path>         Path to write keystore (default: android/app/safety.keystore)
#   -a, --alias <alias>         Key alias (default: safety)
#   -s, --storepass <password>  Keystore password (default: safety123)
#   -k, --keypass <password>    Key password (default: safety123)
#   -f, --force                 Overwrite existing keystore if present
#   --print-base64              Print base64 (single-line) of keystore to stdout after creation
#   --write-base64-file <path>  Write base64 (single-line) to file
#   -h, --help                  Show this help message
#
# After generating:
#   1. Back up the keystore somewhere safe (cloud, USB, etc.)
#   2. If you lose this file, you CANNOT update your app on the Play Store.
#   3. For CI/CD: base64-encode the keystore and add it as a GitHub secret
#      named SAFETY_KEYSTORE_BASE64. Also add:
#        SAFETY_KEYSTORE_PASSWORD, SAFETY_KEY_ALIAS, SAFETY_KEY_PASSWORD
#

set -euo pipefail

# Defaults
KEYSTORE="android/app/safety.keystore"
ALIAS="safety"
STOREPASS="safety123"
KEYPASS="safety123"
FORCE=0
PRINT_BASE64=0
WRITE_BASE64_FILE=""

usage() {
  sed -n '1,120p' "$0" | sed -n '1,40p'
}

# Simple CLI parsing
while [[ $# -gt 0 ]]; do
  case "$1" in
    -o|--output)
      KEYSTORE="$2"; shift 2;;
    -a|--alias)
      ALIAS="$2"; shift 2;;
    -s|--storepass)
      STOREPASS="$2"; shift 2;;
    -k|--keypass)
      KEYPASS="$2"; shift 2;;
    -f|--force)
      FORCE=1; shift;;
    --print-base64)
      PRINT_BASE64=1; shift;;
    --write-base64-file)
      WRITE_BASE64_FILE="$2"; shift 2;;
    -h|--help)
      usage; exit 0;;
    *)
      echo "Unknown option: $1" >&2; usage; exit 2;;
  esac
done

# Check for keytool
if ! command -v keytool >/dev/null 2>&1; then
  echo "ERROR: keytool not found in PATH. Install JDK 17+ or run from Android Studio terminal." >&2
  exit 2
fi

# Ensure directory exists
mkdir -p "$(dirname "$KEYSTORE")"

if [ -f "$KEYSTORE" ] && [ "$FORCE" -ne 1 ]; then
  echo "Keystore already exists at $KEYSTORE — skipping. Use --force to overwrite." >&2
  exit 0
fi

if [ -f "$KEYSTORE" ] && [ "$FORCE" -eq 1 ]; then
  echo "Overwriting existing keystore at $KEYSTORE" >&2
  rm -f "$KEYSTORE"
fi

echo "Generating Safety App signing keystore at: $KEYSTORE"

keytool -genkeypair -v \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$STOREPASS" \
  -keypass "$KEYPASS" \
  -dname "CN=SafetyApp, OU=App, O=DataPulse Social, L=City, ST=State, C=US"

echo
echo "Done! Keystore created at: $KEYSTORE"

echo
echo "IMPORTANT:"
echo "  1. Change the default password (safety123) for production use."
echo "  2. Back up this file — losing it means you can never update your app."
echo "  3. For CI: base64-encode it and add as GitHub secret SAFETY_KEYSTORE_BASE64."
echo

echo "Local base64 commands (examples):"
echo "  base64 $KEYSTORE | pbcopy    # macOS (copies to clipboard)"
echo "  base64 -w 0 $KEYSTORE        # Linux (single-line output)"

# Helper to emit base64 single-line, compatible with macOS and Linux
emit_base64() {
  if command -v base64 >/dev/null 2>&1; then
    # Try Linux style (no-wrap). If it fails, fall back to default base64 (macOS)
    base64 -w 0 "$KEYSTORE" 2>/dev/null || base64 "$KEYSTORE"
  else
    # As a last resort, use openssl
    if command -v openssl >/dev/null 2>&1; then
      openssl base64 -in "$KEYSTORE"
    else
      echo "ERROR: no base64 or openssl binary found to generate base64 output." >&2
      return 1
    fi
  fi
}

if [ "$PRINT_BASE64" -eq 1 ]; then
  emit_base64
fi

if [ -n "${WRITE_BASE64_FILE:-}" ]; then
  emit_base64 > "$WRITE_BASE64_FILE"
  echo "Wrote base64 to $WRITE_BASE64_FILE"
fi

exit 0
