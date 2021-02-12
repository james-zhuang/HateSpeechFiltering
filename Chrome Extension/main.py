from fastapi import FastAPI
import numpy as np
import pickle as pkl
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
with open("model_file.pkl", "rb") as f:
    model = pkl.load(f)

# Hello World route
@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/predict/")
def predict(text: str):
    if "virus" in text:
        return True
    else:
        return False
    # return "Got it!"

