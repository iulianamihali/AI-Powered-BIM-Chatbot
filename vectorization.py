from sentence_transformers import SentenceTransformer
import numpy as np
import os

model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

folder_path = os.path.join(os.getcwd(), 'Data', 'CleanedData')
output_folder = os.path.join(os.getcwd(), 'Data', 'VectorizedData')
os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(folder_path):
    file_path = os.path.join(folder_path, filename)
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()

    vector = model.encode(text).astype('float32')

    output_file_path = os.path.join(output_folder, filename)
    np.savetxt(output_file_path, vector)
    print(f"Document '{filename}' vectorized and saved.")
