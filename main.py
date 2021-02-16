from fastapi import FastAPI
import numpy as np
import pickle as pkl
from fastapi.middleware.cors import CORSMiddleware
import bert_model

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# with open("model_file.pkl", "rb") as f:
#     model = pkl.load(f)


# Hello World route
@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/predict/")
def predict(text: str):

    res = bert_model.pipeline_(text) # returns a list of dictionaries with label and score
    if res[0]['label'] == 'hatespeech' or res[0]['label'] == 'offensive':
        return True
    else:
        return False

    # if "virus" in text:
    #     return True
    # else:
    #     return False
    # return "Got it!"

