"""
Neural network model

Go to line  120 for the actual ensemble 
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

# For reading the json
import sys, json

# For using the models
from sklearn.model_selection import *
from keras.wrappers.scikit_learn import KerasClassifier
from sklearn.ensemble import  VotingClassifier
import pandas
import pickle

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

def calculate_senti(text):

    x7_df = pd.DataFrame(columns=["posneg", "compound"])

    # compute x7: sentimental value
    analyzer = SentimentIntensityAnalyzer()

    senti = analyzer.polarity_scores(text)
    # print(neg)
    neg = senti['neg']
    neu = senti['neu']
    pos = senti['pos']
    compound = senti['compound']

    # new_series = pd.Series([pos-neg, compound], index=["posneg", "compound"])

    # return new_series
    return (pos-neg, compound)

def parse_info(info):
    tweet = info[0]
    demographics = info[1]
    text = tweet["text"]
    user_id = demographics["user_id"]
    screen_name = demographics["screen_name"]
    followers_count = demographics["followers_count"]
    favorites_count = demographics["favorites_count"]
    friends_count = demographics["friends_count"]
    urban_sexist = demographics["urban_score"]
    oxford_sexist = demographics["oxford_score"]
    sex_words_ratio = demographics["sex_words_ratio"]

    (posneg, compound) = calculate_senti(text)
    # print("compound:" + str(compound))
    # return text, user_id, screen_name, followers_count, favorites_count
    return pd.Series([urban_sexist, oxford_sexist, followers_count, favorites_count, friends_count,sex_words_ratio, posneg, compound])


"""
Ensemble using SVM and NN for sexist commennts binary classification 

""" 

#print(nn_ensemble_model("you are a slut"))

svm_path = script_path+"/WebServer/python/SVM/svm_rbf.sav"

txtSVM  = pickle.load(open(svm_path, 'rb'))

"""

#Creating sci-kit learn object for classifier voting
sk_nn_classifier = KerasClassifier(build_fn = nn_ensemble_model)

estimators = []
model1 = txtSVM
estimators.append(('svm', model1))
model2 = sk_nn_classifier
estimators.append(('nn', model2))

# create the Voting Classifier ensemble model
ensemble = VotingClassifier(estimators)


"""

while True:

    #reading the jsons
    line1 = sys.stdin.readline()
    tweet = json.loads(line1)

    line2 = sys.stdin.readline()
    demographics = json.loads(line2)
    
    ### BEGINNING OF ESEMBLE CODE ###

    raw_text = tweet["text"]

    nn_score = nn_ensemble_model(raw_text)

    svm_input = parse_info( [tweet, demographics] )

    svm_score =  1 - txtSVM.predict_proba(svm_input.values.reshape(1,-1))[0][0]    

    ensemble_score = 0.5*svm_score+0.5*nn_score

    print(ensemble_score)



    sys.stdout.flush()

    #### END OF ENSEMBLE CODE ####
