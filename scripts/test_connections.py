import os
import sys
import json
import urllib.request
import urllib.error

print("=" * 60)
print("PR SENTINEL - CONNECTIVITY & CONFIGURATION AUDIT")
print("=" * 60)

env_file = ".env.local" if os.path.exists(".env.local") else ".env"
env_vars = {}
if os.path.exists(env_file):
    print(f"Reading environment from: {env_file}")
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip().strip('"').strip("'")
else:
    print(f"Warning: {env_file} not found")

def get_var(name):
    return env_vars.get(name) or os.environ.get(name) or ""

def is_placeholder(val):
    if not val:
        return True
    lower = val.lower()
    return any(p in lower for p in ["your-project", "your-org", "your_webhook", "eyjhbgcio...", "aizasy...", "ghp_...", "iv1..."])

# 1. Supabase Check
print("\n--- 1. Supabase Connection ---")
sb_url = get_var("VITE_SUPABASE_URL") or get_var("SUPABASE_URL")
sb_anon = get_var("VITE_SUPABASE_ANON_KEY")
sb_service = get_var("SUPABASE_SERVICE_ROLE_KEY")

print(f"Supabase URL: {'SET' if sb_url and not is_placeholder(sb_url) else 'MISSING/PLACEHOLDER'} ({sb_url[:25] if sb_url else 'None'}...)")
print(f"Supabase Anon Key: {'SET' if sb_anon and not is_placeholder(sb_anon) else 'MISSING/PLACEHOLDER'}")
print(f"Supabase Service Role Key: {'SET' if sb_service and not is_placeholder(sb_service) else 'MISSING/PLACEHOLDER'}")

if sb_url and not is_placeholder(sb_url):
    # Try reaching Supabase REST health / auth endpoint
    test_url = f"{sb_url.rstrip('/')}/rest/v1/"
    req = urllib.request.Request(test_url, headers={
        "apikey": sb_anon if sb_anon and not is_placeholder(sb_anon) else "",
        "Authorization": f"Bearer {sb_anon}" if sb_anon and not is_placeholder(sb_anon) else ""
    })
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"-> Supabase REST API HTTP Status: {resp.status} (SUCCESS)")
    except urllib.error.HTTPError as e:
        print(f"-> Supabase REST API HTTP Response: {e.code} ({e.reason})")
    except Exception as e:
        print(f"-> Supabase Connection Error: {e}")

# 2. AI Provider Check
print("\n--- 2. AI Provider Connection ---")
ai_provider = get_var("AI_PROVIDER") or "gemini"
gemini_key = get_var("GEMINI_API_KEY")
ollama_url = get_var("OLLAMA_BASE_URL")
print(f"AI Provider Selected: {ai_provider}")
print(f"Gemini API Key: {'SET' if gemini_key and not is_placeholder(gemini_key) else 'MISSING/PLACEHOLDER'}")
print(f"Ollama Base URL: {ollama_url if ollama_url else 'None'}")

if gemini_key and not is_placeholder(gemini_key):
    # Test Gemini API connectivity
    g_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}"
    try:
        req = urllib.request.Request(g_url)
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode())
            models_cnt = len(data.get("models", []))
            print(f"-> Gemini API Connected! Available models count: {models_cnt}")
    except Exception as e:
        print(f"-> Gemini API Check Failed: {e}")

if ollama_url:
    try:
        req = urllib.request.Request(f"{ollama_url.rstrip('/')}/api/tags")
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            print(f"-> Ollama Connected! Local models: {[m['name'] for m in data.get('models', [])]}")
    except Exception as e:
        print(f"-> Ollama Not reachable at {ollama_url}: {e}")

# 3. GitHub App Check
print("\n--- 3. GitHub App Integration ---")
gh_app_id = get_var("GITHUB_APP_ID")
gh_secret = get_var("GITHUB_WEBHOOK_SECRET")
gh_key = get_var("GITHUB_PRIVATE_KEY")
gh_client_id = get_var("GITHUB_CLIENT_ID")
gh_client_secret = get_var("GITHUB_CLIENT_SECRET")
print(f"GITHUB_APP_ID: {'SET' if gh_app_id and not is_placeholder(gh_app_id) else 'MISSING/PLACEHOLDER'} ({gh_app_id if gh_app_id else 'None'})")
print(f"GITHUB_WEBHOOK_SECRET: {'SET' if gh_secret and not is_placeholder(gh_secret) else 'MISSING/PLACEHOLDER'}")
print(f"GITHUB_PRIVATE_KEY: {'SET' if gh_key and not is_placeholder(gh_key) else 'MISSING/PLACEHOLDER'}")
print(f"GITHUB_CLIENT_ID: {'SET' if gh_client_id and not is_placeholder(gh_client_id) else 'MISSING/PLACEHOLDER'}")
print(f"GITHUB_CLIENT_SECRET: {'SET' if gh_client_secret and not is_placeholder(gh_client_secret) else 'MISSING/PLACEHOLDER'}")

# 4. Worker Orchestration Check
print("\n--- 4. Actions Worker Orchestration ---")
dispatch_token = get_var("WORKER_DISPATCH_TOKEN")
repo_owner = get_var("WORKER_REPO_OWNER")
repo_name = get_var("WORKER_REPO_NAME")
print(f"WORKER_DISPATCH_TOKEN: {'SET' if dispatch_token and not is_placeholder(dispatch_token) else 'MISSING/PLACEHOLDER'}")
print(f"WORKER_REPO_OWNER: {repo_owner if repo_owner and not is_placeholder(repo_owner) else 'MISSING/PLACEHOLDER'}")
print(f"WORKER_REPO_NAME: {repo_name if repo_name and not is_placeholder(repo_name) else 'MISSING/PLACEHOLDER'}")

if dispatch_token and not is_placeholder(dispatch_token) and repo_owner and not is_placeholder(repo_owner) and repo_name and not is_placeholder(repo_name):
    # Test GitHub API repo access
    gh_api_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}"
    try:
        req = urllib.request.Request(gh_api_url, headers={
            "Authorization": f"Bearer {dispatch_token}",
            "User-Agent": "PR-Sentinel-Tester",
            "Accept": "application/vnd.github+json"
        })
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            print(f"-> GitHub Repository accessible: {data.get('full_name')} (Private: {data.get('private')})")
    except Exception as e:
        print(f"-> GitHub API dispatch token check failed: {e}")

print("\n" + "=" * 60)
