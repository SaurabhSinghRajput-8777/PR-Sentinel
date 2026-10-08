import os
import sys
import json
import time
import urllib.request
import urllib.error
import jwt

print("============================================================")
print("PR SENTINEL - DEEP CONNECTIVITY & REPOSITORY AUDIT")
print("============================================================")

def parse_env_file(filepath):
    env = {}
    if not os.path.exists(filepath):
        return env
    current_key = None
    current_val = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            stripped = line.strip()
            if current_key is None:
                if stripped and not stripped.startswith("#") and "=" in stripped:
                    k, v = stripped.split("=", 1)
                    k = k.strip()
                    v = v.strip()
                    if v.startswith('"') and not (v.endswith('"') and len(v) > 1):
                        current_key = k
                        current_val = [v[1:]]
                    else:
                        env[k] = v.strip('"').strip("'")
            else:
                if line.rstrip().endswith('"'):
                    current_val.append(line.rstrip()[:-1])
                    env[current_key] = "\n".join(current_val)
                    current_key = None
                    current_val = []
                else:
                    current_val.append(line.rstrip())
    return env

env = parse_env_file(".env.local")

# 1. Supabase Check
print("\n[1] SUPABASE BACKEND & DATABASE")
sb_url = env.get("VITE_SUPABASE_URL") or env.get("SUPABASE_URL")
sb_anon = env.get("VITE_SUPABASE_ANON_KEY")
sb_service = env.get("SUPABASE_SERVICE_ROLE_KEY")

print(f"  URL: {sb_url[:35]}...")
print(f"  Anon Key: {'Present' if sb_anon else 'Missing'}")
print(f"  Service Role Key: {'Present' if sb_service else 'Missing'}")

# Verify live query
try:
    req = urllib.request.Request(f"{sb_url}/rest/v1/repositories?select=count", headers={
        "apikey": sb_service,
        "Authorization": f"Bearer {sb_service}",
        "Range": "0-0"
    })
    with urllib.request.urlopen(req, timeout=5) as resp:
        print("  Database Connection: ACTIVE (200 OK)")
except Exception as e:
    print(f"  Database Connection Error: {e}")

# Check tables
schema_tables = [
    "organizations", "profiles", "github_installations", "repositories",
    "webhook_events", "pull_requests", "analysis_jobs", "analysis_runs",
    "findings", "developer_signals", "reviewer_recommendations",
    "generated_fixes", "validation_runs", "audit_logs"
]
missing_tables = []
for t in schema_tables:
    try:
        req = urllib.request.Request(f"{sb_url}/rest/v1/{t}?select=count", headers={
            "apikey": sb_service,
            "Authorization": f"Bearer {sb_service}",
            "Range": "0-0"
        })
        with urllib.request.urlopen(req, timeout=3) as resp:
            pass
    except Exception:
        missing_tables.append(t)

if missing_tables:
    print(f"  Tables Missing in DB: {missing_tables}")
else:
    print(f"  Database Schema: ALL {len(schema_tables)} TABLES READY & MIGRATED")

# 2. AI Providers
print("\n[2] AI PROVIDERS")
ai_provider = env.get("AI_PROVIDER", "gemini")
gemini_key = env.get("GEMINI_API_KEY")
print(f"  Active Provider: {ai_provider}")
if gemini_key:
    try:
        g_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}"
        req = urllib.request.Request(g_url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            print(f"  Gemini API: CONNECTED ({len(data.get('models', []))} models available)")
    except Exception as e:
        print(f"  Gemini API Connection: FAILED ({e})")
else:
    print("  Gemini API Key: NOT SET")

# 3. GitHub App Authentication
print("\n[3] GITHUB APP INTEGRATION")
app_id = env.get("GITHUB_APP_ID")
pem = env.get("GITHUB_PRIVATE_KEY")
webhook_secret = env.get("GITHUB_WEBHOOK_SECRET")
client_id = env.get("GITHUB_CLIENT_ID")
client_secret = env.get("GITHUB_CLIENT_SECRET")

print(f"  App ID: {app_id}")
print(f"  Webhook Secret: {'Configured' if webhook_secret else 'Missing'}")
print(f"  Client ID (OAuth): {client_id if client_id and '...' not in client_id else 'NOT SET / PLACEHOLDER'}")
print(f"  Client Secret (OAuth): {'Configured' if client_secret and '...' not in client_secret else 'NOT SET / PLACEHOLDER'}")

if app_id and pem:
    try:
        now = int(time.time())
        payload = {"iat": now - 60, "exp": now + 600, "iss": app_id}
        token = jwt.encode(payload, pem, algorithm="RS256")
        
        req = urllib.request.Request("https://api.github.com/app", headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "PR-Sentinel"
        })
        with urllib.request.urlopen(req, timeout=5) as resp:
            app_meta = json.loads(resp.read().decode())
            print(f"  GitHub App Authenticated: '{app_meta.get('name')}' (slug: {app_meta.get('slug')})")

        # Installations
        req2 = urllib.request.Request("https://api.github.com/app/installations", headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "PR-Sentinel"
        })
        with urllib.request.urlopen(req2, timeout=5) as resp:
            installs = json.loads(resp.read().decode())
            print(f"  GitHub App Installations: {len(installs)} active installation(s)")
            for inst in installs:
                print(f"    -> Account: {inst.get('account', {}).get('login')} (Installation ID: {inst.get('id')})")
    except Exception as e:
        print(f"  GitHub App Auth FAILED: {e}")
else:
    print("  GitHub App Credentials: Incomplete")

# 4. Actions Worker Orchestration
print("\n[4] WORKER ORCHESTRATION & REPOSITORY DISPATCH")
dispatch_token = env.get("WORKER_DISPATCH_TOKEN")
repo_owner = env.get("WORKER_REPO_OWNER")
repo_name = env.get("WORKER_REPO_NAME")

print(f"  WORKER_REPO_OWNER: {repo_owner if repo_owner and 'your-org' not in repo_owner else 'MISSING / UNCONFIGURED'}")
print(f"  WORKER_REPO_NAME: {repo_name if repo_name else 'MISSING'}")
print(f"  WORKER_DISPATCH_TOKEN: {'Configured' if dispatch_token and 'ghp_' not in dispatch_token else 'MISSING / UNCONFIGURED'}")

print("\n============================================================")
