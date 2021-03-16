from fastapi import FastAPI, status, HTTPException
import numpy as np
import pickle as pkl
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import pipeline
import time
import os
import pymysql
from fastapi.responses import JSONResponse
import googleclouddebugger
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class tweetModel(BaseModel):
    tweet_text: str

db_user = os.environ.get('CLOUD_SQL_USERNAME')
db_password = os.environ.get('CLOUD_SQL_PASSWORD')
db_name = os.environ.get('CLOUD_SQL_DATABASE_NAME')
db_connection_name = os.environ.get('CLOUD_SQL_CONNECTION_NAME')


try:
  googleclouddebugger.enable(
    breakpoint_enable_canary=True
  )
except ImportError:
  pass

pipeline_ = None


@app.on_event("startup")
async def startup_event():
    global pipeline_
    tokenizer = AutoTokenizer.from_pretrained("Hate-speech-CNERG/bert-base-uncased-hatexplain", use_fast=False)
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


@app.post("/flag_tweet/")
async def flag_tweet(tweet: tweetModel):
    # try:
    # When deployed to App Engine, the `GAE_ENV` environment variable will be
    # set to `standard`
    #     if os.environ.get('GAE_ENV') == 'standard':
            # If deployed, use the local socket interface for accessing Cloud SQL
    unix_socket = '/cloudsql/{}'.format(db_connection_name)
    cnx = pymysql.connect(user=db_user, password=db_password,
                          unix_socket=unix_socket, db=db_name)

    with cnx.cursor() as cursor:
        cursor.execute('INSERT INTO hate_speech_tweets (tweet_text) values (%s);', tweet.tweet_text)

    cnx.commit()
    cnx.close()
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=tweet.tweet_text)