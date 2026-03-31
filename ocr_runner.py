import ocrmypdf
from readingData import readingPdf
def ocr_pdf(input_path, output_path):
    try:
        ocrmypdf.ocr(
            input_file=input_path,
            output_file=output_path,
            skip_text=True,
            output_type="pdfa",
        )
        readingPdf(output_path)
    
    except Exception as e:
        print(f"[Eroare la procesarea OCR pentru {input_path}]: {e}")
   