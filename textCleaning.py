import os
import re

input_folder = r"Data\ProcessedData"
output_folder = r"Data\CleanedData"
os.makedirs(output_folder, exist_ok=True)


def curata_text(text):
    text = text.replace('\x0c', ' ')  # caractere de pagină
    text = re.sub(r'\n+', '\n', text)  # elimină linii goale duble
    text = re.sub(r'(?i)pagina[:]?\s*\d+\s*/\s*\d+', '', text)  # Pagina: 1 / 4
    text = re.sub(r'(?i)pagina\s+\d+\s*(din)?\s*\d*', '', text)  # Pagina 1 din 4
    text = re.sub(r'[•\-\*\|›«»]', ' ', text)  # elimină bullets și simboluri comune
    text = re.sub(r'[\.]{3,}', '', text)  # elimină secțiuni de tip „......”
    text = re.sub(r'[^\x00-\x7F]+', '', text)  # elimină caracterele non-ASCII
    text = re.sub(r'\s+', ' ', text)  # spații multiple
    text = re.sub(r'__+', '', text)  # elimină secvențele de caractere inutile (ex. „__”)
    text = re.sub(r'[":{}()\[\]~]', '', text)  # elimină caractere speciale și semne de formatare
    text = text.strip()
    return text


for filename in os.listdir(input_folder):
    if filename.endswith(".txt"):
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, filename)

        with open(input_path, "r", encoding="utf-8") as f:
            content = f.read()


        text_curat = curata_text(content)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text_curat)

        print(f"Curățat și salvat: {output_path}")