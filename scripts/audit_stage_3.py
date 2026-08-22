import os

stage_3_dir = r'c:\Users\nnipu\Downloads\ReconcileGST\stage_3_research'
adrs_dir = r'c:\Users\nnipu\Downloads\ReconcileGST\stage_4_documents\adrs'

def audit_dir(d, title):
    files = sorted(os.listdir(d))
    print(f"=== {title} ({len(files)} files) ===")
    print(f"{'Filename':<45} | {'Bytes':<10} | {'Lines':<8} | {'Words':<8}")
    print("-" * 80)
    t_b = 0
    t_l = 0
    t_w = 0
    for f in files:
        path = os.path.join(d, f)
        if os.path.isfile(path):
            size = os.path.getsize(path)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
                lines = len(content.splitlines())
                words = len(content.split())
            t_b += size
            t_l += lines
            t_w += words
            print(f"{f:<45} | {size:<10} | {lines:<8} | {words:<8}")
    print("-" * 80)
    print(f"SUBTOTAL: {t_b} bytes | {t_l} lines | {t_w} words\n")
    return t_b, t_l, t_w

b1, l1, w1 = audit_dir(stage_3_dir, "STAGE 3 RESEARCH ARTIFACTS")
b2, l2, w2 = audit_dir(adrs_dir, "STAGE 4 ADRs (Generated in Stage 3)")
print(f"GRAND TOTAL STAGE 3 INTELLIGENCE: {b1+b2} bytes | {l1+l2} lines | {w1+w2} words")
