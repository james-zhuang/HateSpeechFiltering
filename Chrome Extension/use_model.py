import pickle as pkl
import numpy as np

with open("model_file.pkl", "rb") as f:
    model = pkl.load(f)

print(model.predict(np.array([9]).reshape(-1, 1)))