"""
Script that makes predictions based on comments

"""
import os
import sys, json
from keras.preprocessing.text import Tokenizer
from keras import preprocessing
from keras.preprocessing.sequence import pad_sequences
from keras.models import load_model

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


analyser = SentimentIntensityAnalyzer()
def get_sentiment_scores(sentence):
    snt = analyser.polarity_scores(sentence)
    return snt

def Tokenize_New_Instance(new_string, text_length):

    new_instance = []

    new_instance.append(new_string)

    # create the tokenizer
    new_tok= Tokenizer()
    # fit the tokenizer on the documents
    new_tok.fit_on_texts(new_instance)

    tokenized_text = pad_sequences( new_tok.texts_to_sequences(new_instance) , maxlen=text_length)

    return tokenized_text


model = load_model(os.path.dirname(os.path.abspath(__file__)) + '/../../res/sexism_classifier.h5')

while True:
    tweet = sys.stdin.readline()
    #user = sys.stdin.readline()
    first_json = json.loads(tweet)
    #second_json = json.loads(user)
    raw_text = first_json["text"]

    sentiment_of_text = get_sentiment_scores(raw_text)

    text_negativity = sentiment_of_text['neg']

    text_positivity = sentiment_of_text['pos']

    if text_positivity == 0.0 and text_negativity == 0.0 :
        text_positivity = 0.15 #the idea is that if its neutral then is less sexist


    input_prediction = model.predict( Tokenize_New_Instance(raw_text, 50) )

    text_score_nn = input_prediction[0][0]

    probability_score = text_score_nn + text_negativity - text_positivity  

    if probability_score > 1.0 :
        probability_score = 1.0

    if probability_score < 0 :
        probability_score =  0

    print(probability_score)

    sys.stdout.flush()
