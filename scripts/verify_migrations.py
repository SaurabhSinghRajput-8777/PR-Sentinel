import re

files = [
    'supabase/migrations/0001_initial.sql',
    'supabase/migrations/0002_indexes.sql',
    'supabase/migrations/0003_rls.sql'
]

print("Verifying SQL Migrations...")
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    tables = re.findall(r'CREATE TABLE IF NOT EXISTS (\w+)', content)
    indexes = re.findall(r'CREATE INDEX IF NOT EXISTS (\w+)', content)
    policies = re.findall(r'CREATE POLICY "([^"]+)"', content)
    print(f"\n=== {f} ===")
    if tables:
        print(f"Tables ({len(tables)}):", tables)
    if indexes:
        print(f"Indexes ({len(indexes)}):", indexes)
    if policies:
        print(f"Policies ({len(policies)}):", policies)
