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
from pydantic import BaseModel, BaseSettings

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Settings(BaseSettings):
    class Config:
        env_file = ".env"

# Tweet model used for consuming the POST request payload
class tweetModel(BaseModel):
    tweet_text: str
    label: int

db_user = os.environ.get('CLOUD_SQL_USERNAME')
db_password = os.environ.get('CLOUD_SQL_PASSWORD')
db_name = os.environ.get('CLOUD_SQL_DATABASE_NAME')
db_connection_name = os.environ.get('CLOUD_SQL_CONNECTION_NAME')
#
# try:
#   googleclouddebugger.enable(
#     breakpoint_enable_canary=True
#   )
# except ImportError:
#   pass

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
    # Unix socket method is used for the App Engine
    unix_socket = '/cloudsql/{}'.format(db_connection_name)
    cnx = pymysql.connect(user=db_user, password=db_password,
                          unix_socket=unix_socket, db=db_name)

    # If running locally, use the TCP connections instead
    # Set up Cloud SQL Proxy (cloud.google.com/sql/docs/mysql/sql-proxy)
    # so that your application can use 127.0.0.1:3306 to connect to your
    # Cloud SQL instance, uncomment the lines below
    # host = '127.0.0.1'
    # cnx = pymysql.connect(user="master", password="cs329s",
    #                       host=host, db="tweets_db")

    # Check if the tweet already exists in the cloud sql db
    with cnx.cursor() as cursor:
        cursor.execute("SELECT hate_speech_counter from hate_speech_tweets WHERE tweet_hash=%s", hash(text))
        result = cursor.fetchone()
        return_value = False
        if result is not None:
            # if the tweet exists, and more than 5 people have tagged it as hate speech, return as hate speech
            if result[0] > 5:
                return_value = True
        else:
            # if the tweet does not exist, query the BERT model
            res = pipeline_(text)  # returns a list of dictionaries with label and score
            hate_speech_counter = 0
            if res[0]['label'] == 'hate speech' or res[0]['label'] == 'offensive':
                return_value = True
                hate_speech_counter = 10

            cursor.execute(
                "INSERT INTO hate_speech_tweets (tweet_text, hate_speech_counter, tweet_hash) values (%s, %s, %s);",
                (text, hate_speech_counter, hash(text)))

    cnx.commit()
    cnx.close()
    return return_value

# Flag tweet as either hate speech or not
@app.post("/flag_tweet/")
async def flag_tweet(tweet: tweetModel):
    # Unix socket method is used for the App Engine
    unix_socket = '/cloudsql/{}'.format(db_connection_name)
    cnx = pymysql.connect(user=db_user, password=db_password,
                          unix_socket=unix_socket, db=db_name)

    # If running locally, use the TCP connections instead
    # Set up Cloud SQL Proxy (cloud.google.com/sql/docs/mysql/sql-proxy)
    # so that your application can use 127.0.0.1:3306 to connect to your
    # Cloud SQL instance, uncomment the lines below
    # host = '127.0.0.1'
    # cnx = pymysql.connect(user="master", password="cs329s",
    #                       host=host, db="tweets_db")

    with cnx.cursor() as cursor:
        # if the tweet is flagged as hate speech, increment the counter in the cloud sql db
        if tweet.label == 1:
            hate_speech_counter = 1
            cursor.execute(
                'UPDATE hate_speech_tweets SET hate_speech_counter = hate_speech_counter + 1 where tweet_hash=%s;',
                hash(tweet.tweet_text))
        # if the tweet is flagged as non-hate speech, decrement the counter in the cloud sql db
        else:
            hate_speech_counter = 0
            cursor.execute(
                'UPDATE hate_speech_tweets SET hate_speech_counter = hate_speech_counter - 1 where tweet_hash=%s;',
                hash(tweet.tweet_text))

        # If the tweet does not exist in the db (which should not be the case since the GET request adds it to the db),
        # add the tweet to the db with the appropriate counter value
        if cursor.rowcount == 0:
            cursor.execute(
                "INSERT INTO hate_speech_tweets (tweet_text, hate_speech_counter, tweet_hash) values (%s, %s, %s);",
                (tweet.tweet_text, hate_speech_counter, hash(tweet.tweet_text)))

    cnx.commit()
    cnx.close()
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=tweet.tweet_text)