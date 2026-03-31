import numpy as np
import os

folder_path = 'Data/VectorizedData'

folder_salvare = 'Data/VectorizedDataNormalized'

os.makedirs(folder_salvare, exist_ok=True)

for filename in os.listdir(folder_path):
    file_path = os.path.join(folder_path, filename)

    if filename.endswith('.txt'):
        vector = np.loadtxt(file_path)

        lungime = np.linalg.norm(vector)

        if lungime != 0:
            vector_normalizat = vector / lungime
        else:
            vector_normalizat = vector

        save_path = os.path.join(folder_salvare, filename)

        np.savetxt(save_path, vector_normalizat)
