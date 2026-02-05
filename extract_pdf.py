import pdfplumber
import json

with pdfplumber.open("Price List (1).pdf") as pdf:
    first_page = pdf.pages[0]
    table = first_page.extract_table()
    if table:
        for row in table[:15]:
            print(row)
    else:
        print("No table found")