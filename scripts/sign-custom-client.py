#!/usr/bin/env python3
"""Sign a UnyDesk custom.txt config with the Unysystems Ed25519 key."""
from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path

try:
    from nacl.signing import SigningKey
except ImportError:
    print("PyNaCl required: pip install PyNaCl", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
KEY_FILE = ROOT / "keys" / "custom_client_signing.key.json"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--config",
        required=True,
        help="JSON file or inline JSON for custom client config",
    )
    parser.add_argument("-o", "--output", default="custom.txt")
    args = parser.parse_args()

    key_data = json.loads(KEY_FILE.read_text())
    seed = base64.b64decode(key_data["secret_key_seed_b64"])
    sk = SigningKey(seed)

    raw = Path(args.config).read_text() if Path(args.config).exists() else args.config
    # normalize as compact JSON bytes
    payload = json.dumps(json.loads(raw), separators=(",", ":")).encode()
    signed = sk.sign(payload).signature + payload  # libsodium sign = sig||msg
    # sodiumoxide sign::sign returns signature||message; verify expects that blob
    # Actually PyNaCl SigningKey.sign returns SignedMessage with .signature and .message
    signed_msg = sk.sign(payload)
    blob = signed_msg.signature + signed_msg.message
    out = base64.b64encode(blob).decode()
    Path(args.output).write_text(out)
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
