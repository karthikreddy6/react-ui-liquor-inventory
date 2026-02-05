import pdfplumber
import csv

output_file = "Price_List.txt"

with pdfplumber.open("Price List (1).pdf") as pdf:
    with open(output_file, "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter="|")
        # Header
        writer.writerow(["Brand Number", "Size", "Code", "Pack Type", "Product Name", "MRP"])
        
        for i, page in enumerate(pdf.pages):
            print(f"Processing page {i+1}/{len(pdf.pages)}...")
            table = page.extract_table()
            if not table:
                continue
            
            # Identify columns
            # The first page has headers, subsequent pages might not or might have different ones.
            # Based on our discovery:
            # col 1: Brand Number
            # col 2: Size Code
            # col 3: Pack Type
            # col 4: Product Name
            # col 7: MRP
            
            for row in table:
                # Skip header rows or empty rows
                if not row or row[0] == "S.no" or row[0] == "" or row[1] == "Brand\nNumber":
                    continue
                
                # Check if it's a valid data row (S.no should be a number)
                if not (row[0] and row[0].isdigit()):
                    continue
                
                brand_number = row[1].replace("\n", " ").strip() if row[1] else ""
                size_code = row[2].replace("\n", " ").strip() if row[2] else ""
                pack_type = row[3].replace("\n", " ").strip() if row[3] else ""
                product_name = row[4].replace("\n", " ").strip() if row[4] else ""
                mrp = row[7].replace("\n", " ").strip() if row[7] else ""
                
                # The user asked for brand number, size, code, pack type, product name, mrp.
                # Since we only have "Size Code", we'll put it in 'Code' and leave 'Size' as the same for now
                # Or maybe Size is empty.
                writer.writerow([brand_number, size_code, size_code, pack_type, product_name, mrp])

print("Done!")
