import json
import os
import random
import csv

out_dir = r'c:\Users\nnipu\Downloads\ReconcileGST\sample_data'
os.makedirs(out_dir, exist_ok=True)

random.seed(42)

VENDORS = [
    ("27AAACT2727Q1ZW", "Tata Steel Limited", "27"),
    ("24AAACR5055K1ZX", "Reliance Industries Limited", "24"),
    ("07AAACL0303P1ZH", "Larsen & Toubro Ltd", "07"),
    ("29AAACI1010N1ZS", "Infosys Limited", "29"),
    ("06AAACI2020M1ZT", "Indian Oil Corporation Ltd", "06"),
    ("24AAACA4040L1ZP", "Adani Ports & SEZ Ltd", "24"),
    ("29AAACW3030K1ZU", "Wipro Enterprises Pvt Ltd", "29"),
    ("27AAACB6060J1ZV", "Bajaj Auto Limited", "27"),
    ("33AAACM7070H1ZW", "Mahindra & Mahindra Ltd", "33"),
    ("19AAACH8080G1ZX", "Hindustan Unilever Limited", "19"),
    ("07AAACU9090F1ZY", "UltraTech Cement Limited", "07"),
    ("27AAACT0101E1ZZ", "Tata Consultancy Services Ltd", "27"),
    ("03AAACG1212D1ZA", "Grasim Industries Limited", "03"),
    ("23AAACB2323C1ZB", "Bharat Petroleum Corp Ltd", "23"),
    ("36AAACN3434B1ZC", "NTPC Limited", "36")
]

erp_invoices = []
gstr2b_b2b = {}

# 1. 7,000 Exact Matches
for i in range(1, 7001):
    gstin, name, pos = random.choice(VENDORS)
    inv_no = f"INV-2026-{10000 + i}"
    date = f"2026-08-{random.randint(1, 14):02d}"
    taxable = round(random.uniform(5000, 250000), 2)
    rate = 0.18
    is_intra = (pos == "27")
    if is_intra:
        cgst = round(taxable * rate / 2, 2)
        sgst = cgst
        igst = 0.0
    else:
        igst = round(taxable * rate, 2)
        cgst = 0.0
        sgst = 0.0
    total = round(taxable + igst + cgst + sgst, 2)
    
    erp_invoices.append({
        "gstin": gstin,
        "supplier_name": name,
        "invoice_number": inv_no,
        "invoice_date": date,
        "taxable_value": taxable,
        "igst": igst,
        "cgst": cgst,
        "sgst": sgst,
        "cess": 0.0,
        "total_value": total,
        "pos": pos,
        "doc_type": "INV"
    })
    
    if gstin not in gstr2b_b2b:
        gstr2b_b2b[gstin] = []
    gstr2b_b2b[gstin].append({
        "inum": inv_no,
        "idt": f"{date[8:10]}-{date[5:7]}-{date[0:4]}",
        "val": total,
        "pos": pos,
        "rchrg": "N",
        "inv_typ": "R",
        "itcavl": "Y",
        "items": [{
            "num": 1,
            "txval": taxable,
            "rt": 18.0,
            "iamt": igst,
            "camt": cgst,
            "samt": sgst,
            "csamt": 0.0
        }]
    })

# 2. 1,500 Syntax Matches (Section 170 +/- Rs 1.00)
for i in range(1, 1501):
    gstin, name, pos = random.choice(VENDORS)
    seq = 20000 + i
    erp_inv = f"INV/2026-27/{seq}"
    g2b_inv = f"{seq}"
    date = f"2026-08-{random.randint(1, 14):02d}"
    taxable = round(random.uniform(10000, 150000), 2)
    rate = 0.18
    is_intra = (pos == "27")
    if is_intra:
        cgst = round(taxable * rate / 2, 2)
        sgst = cgst
        igst = 0.0
    else:
        igst = round(taxable * rate, 2)
        cgst = 0.0
        sgst = 0.0
    
    # Add slight rounding diff in ERP (+/- 0.60)
    round_diff = random.choice([-0.60, -0.40, 0.25, 0.50, 0.80])
    erp_total = round(taxable + igst + cgst + sgst + round_diff, 2)
    g2b_total = round(taxable + igst + cgst + sgst, 2)
    
    erp_invoices.append({
        "gstin": gstin,
        "supplier_name": name,
        "invoice_number": erp_inv,
        "invoice_date": date,
        "taxable_value": taxable,
        "igst": igst,
        "cgst": cgst,
        "sgst": sgst,
        "cess": 0.0,
        "total_value": erp_total,
        "pos": pos,
        "doc_type": "INV"
    })
    
    if gstin not in gstr2b_b2b:
        gstr2b_b2b[gstin] = []
    gstr2b_b2b[gstin].append({
        "inum": g2b_inv,
        "idt": f"{date[8:10]}-{date[5:7]}-{date[0:4]}",
        "val": g2b_total,
        "pos": pos,
        "rchrg": "N",
        "inv_typ": "R",
        "itcavl": "Y",
        "items": [{
            "num": 1,
            "txval": taxable,
            "rt": 18.0,
            "iamt": igst,
            "camt": cgst,
            "samt": sgst,
            "csamt": 0.0
        }]
    })

# 3. 500 Typo Fuzzy Matches
for i in range(1, 501):
    gstin, name, pos = random.choice(VENDORS)
    seq = 30000 + i
    erp_inv = f"BILL-2026-{seq}"
    # Typo in GSTR2B (transposition)
    s_seq = str(seq)
    transposed = s_seq[:-2] + s_seq[-1] + s_seq[-2]
    g2b_inv = f"BILL-2026-{transposed}"
    date = f"2026-08-{random.randint(1, 14):02d}"
    taxable = round(random.uniform(8000, 85000), 2)
    rate = 0.18
    igst = round(taxable * rate, 2)
    total = round(taxable + igst, 2)
    
    erp_invoices.append({
        "gstin": gstin,
        "supplier_name": name,
        "invoice_number": erp_inv,
        "invoice_date": date,
        "taxable_value": taxable,
        "igst": igst,
        "cgst": 0.0,
        "sgst": 0.0,
        "cess": 0.0,
        "total_value": total,
        "pos": pos,
        "doc_type": "INV"
    })
    if gstin not in gstr2b_b2b:
        gstr2b_b2b[gstin] = []
    gstr2b_b2b[gstin].append({
        "inum": g2b_inv,
        "idt": f"{date[8:10]}-{date[5:7]}-{date[0:4]}",
        "val": total,
        "pos": pos,
        "rchrg": "N",
        "inv_typ": "R",
        "itcavl": "Y",
        "items": [{
            "num": 1,
            "txval": taxable,
            "rt": 18.0,
            "iamt": igst,
            "camt": 0.0,
            "samt": 0.0,
            "csamt": 0.0
        }]
    })

# 4. 500 POS Table 9A Swaps
for i in range(1, 501):
    gstin, name, pos = random.choice(VENDORS)
    seq = 40000 + i
    inv_no = f"INV-2026-{seq}"
    date = f"2026-08-{random.randint(1, 14):02d}"
    taxable = round(random.uniform(20000, 120000), 2)
    rate = 0.18
    total_tax = round(taxable * rate, 2)
    total = round(taxable + total_tax, 2)
    
    # In ERP booked as IGST
    erp_invoices.append({
        "gstin": gstin,
        "supplier_name": name,
        "invoice_number": inv_no,
        "invoice_date": date,
        "taxable_value": taxable,
        "igst": total_tax,
        "cgst": 0.0,
        "sgst": 0.0,
        "cess": 0.0,
        "total_value": total,
        "pos": "24",
        "doc_type": "INV"
    })
    
    # In GSTR2B filed as CGST + SGST (intra)
    if gstin not in gstr2b_b2b:
        gstr2b_b2b[gstin] = []
    gstr2b_b2b[gstin].append({
        "inum": inv_no,
        "idt": f"{date[8:10]}-{date[5:7]}-{date[0:4]}",
        "val": total,
        "pos": "27",
        "rchrg": "N",
        "inv_typ": "R",
        "itcavl": "Y",
        "items": [{
            "num": 1,
            "txval": taxable,
            "rt": 18.0,
            "iamt": 0.0,
            "camt": round(total_tax / 2, 2),
            "samt": round(total_tax / 2, 2),
            "csamt": 0.0
        }]
    })

# 5. 500 Missing in 2B (Rule 37A Defaulting Vendors)
for i in range(1, 501):
    gstin, name, pos = random.choice(VENDORS)
    seq = 50000 + i
    inv_no = f"INV-2026-{seq}"
    days_ago = random.choice([25, 45, 80, 195])
    date = "2026-06-15" if days_ago > 60 else "2026-08-01"
    taxable = round(random.uniform(50000, 300000), 2)
    rate = 0.18
    igst = round(taxable * rate, 2)
    total = round(taxable + igst, 2)
    
    erp_invoices.append({
        "gstin": gstin,
        "supplier_name": name,
        "invoice_number": inv_no,
        "invoice_date": date,
        "taxable_value": taxable,
        "igst": igst,
        "cgst": 0.0,
        "sgst": 0.0,
        "cess": 0.0,
        "total_value": total,
        "pos": pos,
        "doc_type": "INV"
    })
    # Not added to GSTR-2B!

# Write GSTR-2B JSON
gstr2b_json = {
    "gstin": "27AAACB2026A1Z5",
    "fp": "082026",
    "b2b": []
}
for ctin, invs in gstr2b_b2b.items():
    gstr2b_json["b2b"].append({
        "ctin": ctin,
        "inv": invs
    })

json_path = os.path.join(out_dir, "gstr2b_august_2026.json")
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(gstr2b_json, f, indent=2)

# Write Tally CSV
tally_csv_path = os.path.join(out_dir, "tally_purchase_register_august_2026.csv")
with open(tally_csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "GSTIN/UIN", "Party Name", "Voucher No", "Date", 
        "Taxable Amount", "Integrated Tax Amount", "Central Tax Amount", 
        "State Tax Amount", "Cess Amount", "Total Invoice Amount", "Place of Supply", "Voucher Type"
    ])
    for inv in erp_invoices:
        writer.writerow([
            inv["gstin"], inv["supplier_name"], inv["invoice_number"], inv["invoice_date"],
            inv["taxable_value"], inv["igst"], inv["cgst"], inv["sgst"], inv["cess"],
            inv["total_value"], inv["pos"], inv["doc_type"]
        ])

# Write Zoho CSV (Alternative Header Names)
zoho_csv_path = os.path.join(out_dir, "zoho_purchase_register_august_2026.csv")
with open(zoho_csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "Vendor GSTIN", "Vendor Name", "Bill#", "Bill Date", 
        "Item Total", "IGST Amount", "CGST Amount", 
        "SGST Amount", "Cess", "Bill Total", "Destination State", "Doc Type"
    ])
    for inv in erp_invoices:
        writer.writerow([
            inv["gstin"], inv["supplier_name"], inv["invoice_number"], inv["invoice_date"],
            inv["taxable_value"], inv["igst"], inv["cgst"], inv["sgst"], inv["cess"],
            inv["total_value"], inv["pos"], inv["doc_type"]
        ])

print(f"Sample data generated successfully in {out_dir}:")
print(f"- {json_path} ({os.path.getsize(json_path):,} bytes, {len(gstr2b_b2b)} vendors, 9,500 GSTR-2B invoices)")
print(f"- {tally_csv_path} ({os.path.getsize(tally_csv_path):,} bytes, 10,000 ERP invoices)")
print(f"- {zoho_csv_path} ({os.path.getsize(zoho_csv_path):,} bytes, 10,000 ERP invoices)")
