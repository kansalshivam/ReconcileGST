import os

stage_4_dir = r'c:\Users\nnipu\Downloads\ReconcileGST\stage_4_documents'
files = sorted(os.listdir(stage_4_dir))

print(f"{'Filename':<45} | {'Bytes':<10} | {'Lines':<8} | {'Words':<8}")
print("-" * 80)

total_bytes = 0
total_lines = 0
total_words = 0

for f in files:
    path = os.path.join(stage_4_dir, f)
    if os.path.isfile(path):
        size = os.path.getsize(path)
        with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            lines = len(content.splitlines())
            words = len(content.split())
        total_bytes += size
        total_lines += lines
        total_words += words
        print(f"{f:<45} | {size:<10} | {lines:<8} | {words:<8}")

print("-" * 80)
print(f"TOTAL STAGE 4 DOCUMENTS (15 files): {total_bytes} bytes | {total_lines} lines | {total_words} words")
