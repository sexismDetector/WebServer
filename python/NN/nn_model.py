import os

from keras.preprocessing.text import Tokenizer
from keras import preprocessing
from keras.preprocessing.sequence import pad_sequences
from keras.models import load_model

#### Code Begins
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from keras import preprocessing
from keras.preprocessing.sequence import pad_sequences
from keras.models import load_model

from keras.wrappers.scikit_learn import KerasClassifier

from sys import argv
 
from keras.preprocessing.text import Tokenizer

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
 
script_path = os.path.dirname(os.path.abspath(__file__))

script_path = script_path.replace('python','')
model = load_model(script_path+'res/sexism_classifier.h5')


def nn_ensemble_model(raw_text):
    sentiment_of_text = get_sentiment_scores(raw_text)

    text_negativity = sentiment_of_text['neg']

    text_positivity = sentiment_of_text['pos']

    input_prediction = model.predict( Tokenize_New_Instance(raw_text, 50) )

    text_score_nn = input_prediction[0][0]

    result = text_score_nn + text_negativity - text_positivity  
    
    return result