import os
import re

gst_dir = r'c:\Users\nnipu\Downloads\ReconcileGST'
lib_dir = os.path.join(gst_dir, 'lib')
types_dir = os.path.join(gst_dir, 'types')
comp_dir = os.path.join(gst_dir, 'components')
app_dir = os.path.join(gst_dir, 'app')

exports = {}
for d in [lib_dir, types_dir, comp_dir]:
    for f in os.listdir(d):
        if f.endswith(('.ts', '.tsx')):
            p = os.path.join(d, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
            exp_names = set(re.findall(r'export\s+(?:const|function|interface|type|class|enum)\s+([A-Za-z0-9_]+)', content))
            # match export { ... } or export type { ... }
            for m in re.findall(r'export\s+(?:type\s+)?\{([^}]+)\}', content):
                for item in m.split(','):
                    it = item.strip().split(' as ')[-1].strip()
                    if it:
                        exp_names.add(it)
            exports[f.split('.')[0]] = exp_names

missing = 0
for d in [app_dir, comp_dir, lib_dir]:
    for f in os.listdir(d):
        if f.endswith(('.ts', '.tsx')):
            p = os.path.join(d, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
            for m in re.finditer(r'import\s+\{([^}]+)\}\s+from\s+[\'"]([^\'"]+)[\'"]', content):
                syms = [s.strip().split(' as ')[0].strip() for s in m.group(1).split(',') if s.strip()]
                mod = m.group(2).split('/')[-1]
                if mod in exports:
                    for s in syms:
                        if s not in exports[mod]:
                            print(f'MISSING: {f} needs {s} from {mod}')
                            missing += 1

if missing == 0:
    print('100% CLEAN: All TypeScript imports and exports match perfectly!')
