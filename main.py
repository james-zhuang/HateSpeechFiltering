from fastapi import FastAPI
import numpy as np
import pickle as pkl
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import pipeline
import time

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline_ = None
# with open("model_file.pkl", "rb") as f:
#     model = pkl.load(f)
@app.on_event("startup")
async def startup_event():
    global pipeline_
    tokenizer = AutoTokenizer.from_pretrained("Hate-speech-CNERG/bert-base-uncased-hatexplain")
    model = AutoModelForSequenceClassification.from_pretrained("./pretrained_model")
    pipeline_ = pipeline('sentiment-analysis', model=model, tokenizer=tokenizer)

# Hello World route
@app.get("/")
async def read_root():
    return {"Hello": "API endpoint is running"}

@app.get("/predict/")
async def predict(text: str):
    # time.sleep(0.3)
    res = pipeline_(text) # returns a list of dictionaries with label and score
    if res[0]['label'] == 'hate speech' or res[0]['label'] == 'offensive':
        return True
    else:
        return False

    # if "virus" in text:
    #     return True
    # else:
    #     return False
    # return "Got it!"

