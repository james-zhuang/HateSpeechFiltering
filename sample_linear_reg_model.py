from sklearn.linear_model import LinearRegression
import numpy as np
import pickle as pkl

x = np.array([2, 3, 4, 5, 6]).reshape(-1, 1)
print(x.shape)
y = np.array([4, 6, 8, 10, 12])
model = LinearRegression()
model.fit(x, y)

with open("model_file.pkl", "wb") as pkl_file:
    pkl.dump(model, pkl_file)
#print(model.predict(np.array([9]).reshape(-1, 1)))
