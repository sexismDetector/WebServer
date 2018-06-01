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

tweets_tokens = Tokenize_tweets(raw_tweets)
Y_df = pd.read_csv("Y_df.csv")
tweets_labels = Y_df.iloc[:,1]


####

indices = np.arange(tweets_tokens.shape[0])

np.random.shuffle(indices)

tweets_tokens = tweets_tokens[indices]
tweets_labels = tweets_labels[indices]



index_eighty = round(0.8*len(tweets_tokens))

index_fifty = round(0.5*len(tweets_tokens))

current_index = index_eighty


x_non_test = np.array( tweets_tokens[:current_index] )
y_non_test= np.array( tweets_labels[:current_index] )

# This is the data that the model will never see during prediction
x_test =  np.array( tweets_tokens[current_index:] )
y_test =  np.array( tweets_labels[current_index:] )


random_state_seed = random.randint(0,999)

x_train, x_val, y_train, y_val = train_test_split(x_non_test, y_non_test, test_size=0.2, random_state=random_state_seed)


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
#model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))
#model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))
#model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))
#model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))
#model.add(Dropout(0.2))
model.add(Dense(100, activation='relu'))

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

rand_id = str(random_state_seed)
id_tag = "A"+rand_id

id_tag = "A"+rand_id

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



print("--- %s seconds ---" % (time.time() - start_time))
