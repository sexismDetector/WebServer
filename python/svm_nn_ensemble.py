"""
Neural network model

Go to line  69 for the actual ensemble 
"""

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

#script_path = script_path.replace('python','')
#model = load_model(script_path+'res/sexism_classifier.h5')



# creating path for testing in my machine
script_path = script_path.replace('WebServer/python','')
model = load_model(script_path+'rnn/trial/decente.h5')

def nn_ensemble_model(raw_text):
    sentiment_of_text = get_sentiment_scores(raw_text)

    text_negativity = sentiment_of_text['neg']

    text_positivity = sentiment_of_text['pos']

    input_prediction = model.predict( Tokenize_New_Instance(raw_text, 50) )

    text_score_nn = input_prediction[0][0]

    result = text_score_nn + text_negativity - text_positivity  
    
    return result

"""
Ensemble using SVM and NN for sexist commennts binary classification 

""" 
# For reading the json
import sys, json

# For using the models
from sklearn.model_selection import *
from keras.wrappers.scikit_learn import KerasClassifier
from sklearn.ensemble import  VotingClassifier
import pandas
import pickle

print(nn_ensemble_model("you are a slut"))

script_path = os.path.dirname(os.path.abspath(__file__))

print("\t folder: " + script_path)

the_nn_model_path = script_path+  "/NN"

os.chdir(the_nn_model_path)

rn = os.getcwd()
print("right now "+rn)
from  nn_model import nn_ensemble_model

os.chdir(script_path)



svm_path = script_path+"/SVM/svm_rbf.sav"

txtSVM  = pickle.load(open(svm_path, 'rb'))


#Creating sci-kit learn object for classifier voting
sk_nn_classifier = KerasClassifier(build_fn = nn_ensemble_model)

estimators = []
model1 = txtSVM
estimators.append(('svm', model1))
model2 = sk_nn_classifier
estimators.append(('nn', model2))

# create the Voting Classifier ensemble model
ensemble = VotingClassifier(estimators)


while True:

    #reading the jsons
    tweet = sys.stdin.readline()
    user = sys.stdin.readline()
    first_json = json.loads(tweet)
    #second_json = json.loads(user) 
    
    ### BEGINNING OF ESEMBLE CODE ###



    print(ensemble)



   
    #### END OF ENSEMBLE CODE ####
    sys.stdout.flush()
