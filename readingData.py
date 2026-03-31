from pypdf import PdfReader
import os 

def readingPdf(path):
    reader = PdfReader(path)
    full_text = ""

    for i in range(len(reader.pages)):
        page = reader.pages[i]
        text = page.extract_text()
        
        print(text)
        if text:
            full_text += text + "\n\n"


    if not full_text.strip(): 
        return None

    filename = os.path.splitext(os.path.basename(path))[0]

    output_txt = os.path.join("Data/ProcessedData/", f"{filename}.txt")
    base = os.path.splitext(path)[0]
    
    try:
        with open(output_txt, "w", encoding="utf-8") as f:
            f.write(full_text)
        print(f"Fișier salvat cu succes la: {output_txt}")
    except Exception as e:
        print(f"Eroare la scrierea fișierului: {e}")
   
