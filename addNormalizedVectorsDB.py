from sentence_transformers import SentenceTransformer
import numpy as np
import os

model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
input_folder = "Data/CleanedData"
output_folder = "Data/VectorizedDataNormalized"

os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if filename.endswith(".txt"):
        with open(os.path.join(input_folder, filename), "r", encoding="utf-8") as f:
            content = f.read()
        vector = model.encode(content).astype("float32")
        np.savetxt(os.path.join(output_folder, filename), vector)
        print(f"Vector salvat pentru {filename}: {vector.shape}")
