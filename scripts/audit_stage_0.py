import os

stage_0_dir = r'c:\Users\nnipu\Downloads\ReconcileGST\stage_0_artifacts'
files = sorted(os.listdir(stage_0_dir))

print(f"{'Filename':<35} | {'Bytes':<10} | {'Lines':<8} | {'Words':<8}")
print("-" * 70)

for f in files:
    path = os.path.join(stage_0_dir, f)
    if os.path.isfile(path):
        size = os.path.getsize(path)
        with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            lines = len(content.splitlines())
            words = len(content.split())
        print(f"{f:<35} | {size:<10} | {lines:<8} | {words:<8}")
