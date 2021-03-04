from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import pipeline

tokenizer = AutoTokenizer.from_pretrained("Hate-speech-CNERG/bert-base-uncased-hatexplain")
model = AutoModelForSequenceClassification.from_pretrained("./pretrained_model")
pipeline_ = pipeline('sentiment-analysis', model=model, tokenizer=tokenizer)

