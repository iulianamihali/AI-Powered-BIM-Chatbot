import os
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

folder_path = os.path.join(BASE_DIR, "Data", "VectorizedDataNormalized")
vectori = []
nume_fisiere = []

for filename in os.listdir(folder_path):
    if filename.endswith(".txt"):
        vector = np.loadtxt(os.path.join(folder_path, filename))
        vectori.append(vector)
        nume_fisiere.append(filename)

vectori = np.array(vectori).astype("float32")
index = faiss.IndexFlatL2(vectori.shape[1])
index.add(vectori)

def cauta_context(user_message: str, max_context_chars: int = 1000) -> str:
    query_vector = model.encode([user_message]).astype("float32") #vectorizare intrebare
    D, I = index.search(query_vector, k=3)

    context_parts = []
    for idx in I[0]:
        if idx < 0 or idx >= len(nume_fisiere):
            continue

        nume_fisier = nume_fisiere[idx]
        path_text = os.path.join(BASE_DIR, "Data", "CleanedData", nume_fisier.replace(".txt", ".txt"))

        try:
            with open(path_text, "r", encoding="utf-8") as f:
                text = f.read()
                context_parts.append(text)
        except FileNotFoundError:
            continue

        if not context_parts:
            return "Am găsit vectori similari, dar nu am putut extrage contextul din fișierele originale."

    context = "\n".join(context_parts)
    return context[:max_context_chars]  # Trunchiază dacă e prea lung
