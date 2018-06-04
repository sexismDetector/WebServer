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


def parse_user_json(demographics,text):

    user_id = demographics["user_id"]
    screen_name = demographics["screen_name"]
    followers_count = demographics["followers_count"]
    favorites_count = demographics["favorites_count"]
    friends_count = demographics["friends_count"]
    urban_sexist = demographics["urban_score"]
    oxford_sexist = demographics["oxford_score"]
    sex_words_ratio = demographics["sex_words_ratio"]

    sentiment = SentimentIntensityAnalyzer(text)

    t_neg = sentiment['neg']

    t_pos = sentiment['pos']

    tmp =  [urban_sexist,oxford_sexist, followers_count, favorites_count, friends_count,    sex_words_ratio, t_neg, t_pos ]

    return np.array([tmp])






model = load_model(os.path.dirname(os.path.abspath(__file__)) + '/sexism_classifier.h5')

while True:
    tweet = sys.stdin.readline()
    user = sys.stdin.readline()
    first_json = json.loads(tweet)
    second_json = json.loads(user) 
    raw_text = first_json["text"]

    user_info = parse_user_json(second_json,raw_text )



    tokenized_input = np.array([Tokenize_New_Instance(raw_text, 50)])


    t_p = model.predict( [tokenized_input,user_info ]  )
    probability_score = t_p[0]

 

    print(probability_score[0])

    sys.stdout.flush()
