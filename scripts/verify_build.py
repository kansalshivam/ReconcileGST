import os

root_dir = r'c:\Users\nnipu\Downloads\ReconcileGST'

def walk_dir(d, rel=""):
    items = sorted(os.listdir(d))
    out = []
    for item in items:
        if item in ['.git', 'node_modules', '.next', '__pycache__', 'master-engineering-skill']:
            continue
        p = os.path.join(d, item)
        r = os.path.join(rel, item) if rel else item
        if os.path.isdir(p):
            out.extend(walk_dir(p, r))
        else:
            size = os.path.getsize(p)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                lines = len(fp.read().splitlines())
            out.append((r, size, lines))
    return out

all_files = walk_dir(root_dir)
print(f"{'Path':<55} | {'Bytes':<10} | {'Lines':<8}")
print("-" * 80)
total_bytes = 0
total_lines = 0
for r, size, lines in all_files:
    total_bytes += size
    total_lines += lines
    print(f"{r:<55} | {size:<10} | {lines:<8}")

print("-" * 80)
print(f"GRAND TOTAL: {len(all_files)} files | {total_bytes} bytes | {total_lines} lines")
