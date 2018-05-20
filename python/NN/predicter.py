"""
Script that makes predictions based on comments

"""
import sys, json
from keras.preprocessing.text import Tokenizer
from keras import preprocessing
from keras.preprocessing.sequence import pad_sequences
from keras.models import load_model

def Tokenize_New_Instance(new_string, text_length):

    new_instance = []

    new_instance.append(new_string)

    # create the tokenizer
    new_tok= Tokenizer()
    # fit the tokenizer on the documents
    new_tok.fit_on_texts(new_instance)

    tokenized_text = pad_sequences( new_tok.texts_to_sequences(new_instance) , maxlen=text_length)

    return tokenized_text


model = load_model('../../res/sexism_classifier.h5')

while True:
    tweet = sys.stdin.readline()
    user = sys.stdin.readline()
    first_json = json.loads(tweet)
    second_json = json.loads(user)
    raw_text = first_json["text"]
    input_prediction = model.predict(Tokenize_New_Instance(raw_text, 200))
    print(input_prediction[0][0])
