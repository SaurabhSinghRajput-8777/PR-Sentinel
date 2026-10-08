import hmac
import hashlib
import json
import urllib.request
import urllib.error
from scripts.deep_audit import env

secret = env.get("GITHUB_WEBHOOK_SECRET").encode("utf-8")
payload_dict = {"zen": "Approachable is better than simple.", "hook_id": 999999}
body = json.dumps(payload_dict).encode("utf-8")
signature = "sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()

url = f"{env.get('VITE_SUPABASE_URL')}/functions/v1/github-webhook"
req = urllib.request.Request(url, data=body, headers={
    "Content-Type": "application/json",
    "x-github-event": "ping",
    "x-github-delivery": "test-ping-connectivity-check",
    "x-hub-signature-256": signature
})

try:
    with urllib.request.urlopen(req, timeout=8) as resp:
        print(f"HMAC Ping Test: SUCCESS (HTTP {resp.status}) -> {resp.read().decode()}")
except urllib.error.HTTPError as e:
    print(f"HMAC Ping Test: HTTP Error {e.code} -> {e.read().decode()}")
except Exception as e:
    print(f"HMAC Ping Test Error: {e}")
