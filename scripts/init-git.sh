#!/usr/bin/env bash
# Initialize git so the AGPL client source can be versioned / published.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -d .git ]; then
  echo "git already initialized"
else
  git init
fi
grep -qxF 'unydesk-api/node_modules/' .gitignore 2>/dev/null || cat >> .gitignore << 'EOF'
unydesk-api/node_modules/
unydesk-console/node_modules/
unydesk-console/dist/
unydesk-api/dist/
unydesk-client/target/
unydesk-client/flutter/build/
unydesk-client/flutter/.dart_tool/
EOF
echo "OK — see docs/SOURCE_OFFER.md for AGPL source offer"
