import numpy as np
from keras.preprocessing.text import Tokenizer
import random
from keras import preprocessing
from keras.preprocessing.sequence import pad_sequences
#from  PostgreSQLConnector import PostgresConnector
from keras.models import Sequential 
from keras.layers import Flatten, Dense
from keras.layers import Embedding
from keras.layers import Dropout
import os

from sklearn.model_selection import train_test_split

import pandas as pd

import datetime
import random

import re

import time
start_time = time.time()

from keras import backend as K
cfg = K.tf.ConfigProto()
cfg.gpu_options.allow_growth = True
K.set_session(K.tf.Session(config=cfg))

def Process_tweet(tweet_string):

    tweet_string = re.sub(r"(?:\@|https?\://)\S+", "", tweet_string)

    tweet_string = tweet_string.replace('&#', '')
    tweet_string = tweet_string.replace('#', '')
    tweet_string = tweet_string.replace('&', '')    
    tweet_string = tweet_string.replace('MK', '')   
    tweet_string = tweet_string.replace('mkr', '')  
    tweet_string = tweet_string.replace('MKR', '')
    tweet_string = tweet_string.replace('&#', '')   
    tweet_string = tweet_string.replace('0', '')            
    tweet_string = tweet_string.replace('1', '')
    tweet_string = tweet_string.replace('2', '')    
    tweet_string = tweet_string.replace('3', '')
    tweet_string = tweet_string.replace('4', '')
    tweet_string = tweet_string.replace('5', '')
    tweet_string = tweet_string.replace('6', '')    
    tweet_string = tweet_string.replace('7', '')
    tweet_string = tweet_string.replace('8', '')    


    return tweet_string

 
def Data_Query(user_query):

    postgres = PostgresConnector()

    connObj = postgres.connect()
    cur = connObj.cursor()


    cur.execute( user_query )
    
    x = []

 
    for row in cur:
 
        
        x.append( row[1].strip("RT ") )
 
    

    cur.close()
    
    return x

 
def Get_list_nonsexist_tweets():

    nonsexist_tweets = Data_Query("SELECT * FROM \"Tweets\" where label = 'none' ")

    for e in range(len(nonsexist_tweets)):
      tmp = re.sub(r"(?:\@|https?\://)\S+", "", nonsexist_tweets[e])
      nonsexist_tweets[e] = Process_tweet(tmp)

    return nonsexist_tweets

 
def Get_list_sexist_tweets():

    sexist_tweets = Data_Query("SELECT * FROM \"Tweets\" where label = 'sexist' ")

    for e in range(len(sexist_tweets)):
        tmp = re.sub(r"(?:\@|https?\://)\S+", "", sexist_tweets[e])
        sexist_tweets[e] =  Process_tweet(tmp)
    return sexist_tweets

  
def Words_Query(user_query):

    postgres = PostgresConnector()

    connObj = postgres.connect()
    cur = connObj.cursor()


    cur.execute( user_query )
    
    x = []

 
    for row in cur:
 
        
        x.append( row[0]  )
 
    

    cur.close()
    
    return x  

def Tokenize_tweets(tweets_vector):
    # Tokenization of tweets
    maxlen = 50
    max_words = 10000

    tokenizer = Tokenizer(num_words=max_words)
    tokenizer.fit_on_texts(tweets_vector)
    sequences = tokenizer.texts_to_sequences(tweets_vector)

    word_index = tokenizer.word_index
    print('Found %s unique tokens.' % len(word_index))

    tweets_tokens = pad_sequences(sequences, maxlen=maxlen)

    return tweets_tokens

def Tokenize_New_Instance(new_string, text_length):

    new_instance = []

    new_instance.append(new_string)

    # create the tokenizer
    new_tok= Tokenizer()
    # fit the tokenizer on the documents
    new_tok.fit_on_texts(new_instance)

    tokenized_text = pad_sequences( new_tok.texts_to_sequences(new_instance) , maxlen=text_length)

    return tokenized_text
"""


nonsexist_tweets = Get_list_nonsexist_tweets()
sexist_tweets = Get_list_sexist_tweets()

sexist_list = Words_Query("SELECT * FROM \"LabeledWords\" where oxford_sexist > 3 OR Urban_sexist > 3")

print(sexist_list[0:5])

print("Sexist tweets length "+str(len(sexist_tweets)))
print("Sexist list length "+str(len(sexist_list)))
sexist_tweets = sexist_tweets + sexist_list
print("New Sexist tweets length "+str(len(sexist_tweets)))


# Join the set of sexist and non sexist tweets in order to tokenize
all_tweets = []

for k in range(len(nonsexist_tweets)):
  all_tweets.append(nonsexist_tweets[k])

for k in range(len(sexist_tweets)):
  all_tweets.append(sexist_tweets[k])
  

#Creating labels vector

tweets_labels = [1]*(len(nonsexist_tweets)+len(sexist_tweets))
index_nonsexist = len(nonsexist_tweets)



for k in range(index_nonsexist):

  tweets_labels[k] = 0 #Since we know that these aren't sexist
  
tweets_labels = np.asarray(tweets_labels)


tweet_ordered_pair = list(zip(all_tweets, tweets_labels))

# Any tweet containing less than 10 characters may not be that useful
indices_to_remove = []
for j in range(len(tweet_ordered_pair)):
    tupla = tweet_ordered_pair[j]
    tweet_length = len(tupla[0])
    if tweet_length < 10:
        indices_to_remove.append(j)

for j in range(len(indices_to_remove)):
    tweet_ordered_pair.pop(indices_to_remove[j] - j )

all_tweets = []

for j in range(len(tweet_ordered_pair)):
    tupla = tweet_ordered_pair[j]
    all_tweets.append(tupla[0])



updated_tweets_labels = []


for j in range(len(tweet_ordered_pair)):
    tupla = tweet_ordered_pair[j]
    updated_tweets_labels.append(tupla[1])
   
  
  
updated_tweets_labels = np.asarray(updated_tweets_labels)
 

# Tokenization of tweets
maxlen = 200
max_words = 10000

tokenizer = Tokenizer(num_words=max_words)
tokenizer.fit_on_texts(all_tweets)
sequences = tokenizer.texts_to_sequences(all_tweets)

word_index = tokenizer.word_index
print('Found %s unique tokens.' % len(word_index))

tweets_tokens = pad_sequences(sequences, maxlen=maxlen)


print('Shape of data tensor:', tweets_tokens.shape)
print('Shape of label tensor:', updated_tweets_labels.shape)



"""

all_data = pd.read_csv("svm.csv")

raw_tweets = np.array(all_data.iloc[:,0])
"""
tmp = []

for k in range(len(raw_tweets)):
    tmp.append(Process_tweet(raw_tweets[k]))

raw_tweets = np.array(tmp)

"""


tweets_tokens = Tokenize_tweets(raw_tweets)
Y_df = pd.read_csv("Y_df.csv")
tweets_labels = Y_df.iloc[:,1]


####

indices = np.arange(tweets_tokens.shape[0])

np.random.shuffle(indices)

tweets_tokens = tweets_tokens[indices]
tweets_labels = tweets_labels[indices]

raw_tweets = raw_tweets[indices]


index_eighty = round(0.8*len(tweets_tokens))

index_fifty = round(0.5*len(tweets_tokens))

current_index = index_eighty


x_non_test = np.array( tweets_tokens[:current_index] )

x_non_test_text = np.array( raw_tweets[:current_index] )

y_non_test= np.array( tweets_labels[:current_index] )

input_ordered_pair = []

for k in range(len(x_non_test)):
    # token, text
    input_ordered_pair.append( [x_non_test[k], x_non_test_text[k]] )



# This is the data that the model will never see during prediction
x_test =  np.array( tweets_tokens[current_index:] )

x_test_text =  np.array( raw_tweets[current_index:] )

y_test =  np.array( tweets_labels[current_index:] )


random_state_seed =  89 #random.randint(0,999)

print("Seed "+str(random_state_seed))

t_x_train, t_x_val, y_train, y_val = train_test_split(input_ordered_pair, y_non_test, test_size=0.2, random_state=random_state_seed)

x_train = []
x_train_text = []

x_val= []
x_val_text = []

for k  in range(len(t_x_train)):
    x_train.append(t_x_train[k][0])
    x_train_text.append(t_x_train[k][1])

for k  in range(len(t_x_val)):
    x_val.append(t_x_val[k][0])
    x_val_text.append(t_x_val[k][1])

x_train = np.array(x_train)
x_train_text = np.array(x_train_text)

x_val = np.array(x_val)
x_val_text = np.array(x_val_text)

print(x_train_text[0:2])

# Retrieving GloVe Matrix

import pickle

embedding_matrix = pickle.load( open( "embedding_matrix.p", "rb" ) )

embedding_dim = 300
max_words = 10000
maxlen = 50

# Definne the neuronal netwrok 
model = Sequential()

model.add(Embedding( max_words, embedding_dim, input_length=maxlen))

model.add(Flatten())

# Adding a classifier layer
from keras.layers import Convolution1D, Flatten, Dropout, Dense
from keras.layers.embeddings import Embedding
from keras.models import Sequential

# Layer specification


model.add(Dense(100, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))
model.add(Dropout(0.2))

model.add(Dense(1, activation='sigmoid'))
model.summary()

#Addig GloVe Embeddings
model.layers[0].set_weights([embedding_matrix])
model.layers[0].trainable = False


model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['acc'])

# Beware that names may confuse validation and dataset
#Rember that giving a tuple instead of a float for validation split is slightly different
history = model.fit(x_train, y_train, epochs=10, batch_size=16, validation_data=(x_val, y_val) )

#now = datetime.datetime.now()
#etiqueta ="d" +str(now.day)+":min" +str(now.hour)+":h"+ str(now.minute)+":s"+ str(now.second)


# Make predictions for x_val to assesss performance
# Use sentiment analysis ensemble

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyser = SentimentIntensityAnalyzer()
def get_sentiment_scores(sentence):
    snt = analyser.polarity_scores(sentence)
    return snt


def Compute_sentiment_nn_score(raw_text, nn_score):

    sentiment_of_text = get_sentiment_scores(raw_text)

    text_negativity = sentiment_of_text['neg']

    text_positivity = sentiment_of_text['pos']

    text_score_nn = nn_score
    
    if text_positivity == 0.0 and text_negativity == 0.0 :
        text_positivity = 0.15
    
    result = text_score_nn + text_negativity - text_positivity  
    
    if result > 1 :
        result = 1
    if result < 0 :
        result = 0
    return result


unformated_raw_propensities = model.predict(x_val)

tmp = [ ]

for k in range(len(x_val)):
    g = unformated_raw_propensities[k]
    tmp.append(g[0])

raw_propensities = np.array(tmp)

ensemble_propensities = []

for k in range(len(raw_propensities)):
    sexist_score = Compute_sentiment_nn_score(x_val_text[k], raw_propensities[k] )
    ensemble_propensities.append(sexist_score)

ensemble_propensities = np.array(ensemble_propensities)

predicted_propensities = ensemble_propensities


ex1 = "i love the way my wife looks at me"
ex2 = "i love the way my bitch looks at me"
score_ex1 = model.predict(Tokenize_New_Instance(ex1,50))
score_ex2 = model.predict(Tokenize_New_Instance(ex2,50))

fex1 = Compute_sentiment_nn_score(ex1, score_ex1)
fex2 = Compute_sentiment_nn_score(ex2, score_ex2)
print("Score for "+ex1+" : is "+str(fex1) )
print("Score for "+ex2+" : is "+str(fex2) )



rand_id = str(random_state_seed)
 

id_tag = "A0"+rand_id

filename = id_tag+" predicted label predicted_propensities.p"

pickle.dump( predicted_propensities, open( '../results/'+filename, "wb" ) )


filename = id_tag+"  raw propensities.p"

pickle.dump( raw_propensities, open( '../results/'+filename, "wb" ) )

filename = id_tag+ ' sexism_classifier.h5'
model.save('../results/'+filename)

filename = id_tag+ ' pre_trained_glove_model.h5'
model.save_weights('../results/'+filename)

filename = id_tag+" last_history.p"
pickle.dump( history.history, open('../results/'+filename, "wb" ) )

filename = id_tag+" random_indices.p"
pickle.dump( indices, open('../results/'+filename , "wb" ) )

used_dataset = [x_train, x_test,x_val, y_train, y_test, y_val]


filename = id_tag+" used_dataset.p"

pickle.dump( used_dataset, open( '../results/'+filename, "wb" ) )
print("--- %s seconds ---" % (time.time() - start_time))
