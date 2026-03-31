from readingData import readingPdf
from ocr_runner import ocr_pdf
import os

raw_folder = "Data/Raw"
output_folder = "Data/ProcessedData"

for filename in os.listdir("Data/Raw"):
    input_path =  os.path.join(raw_folder, filename)
    output_path =os.path.join(output_folder, f"ocr_{filename}")
    
    result = readingPdf(input_path)

    if result is None:
        print("[!] Nu s-a găsit text nativ. Aplic OCR...")
        ocr_pdf(input_path, output_path)
