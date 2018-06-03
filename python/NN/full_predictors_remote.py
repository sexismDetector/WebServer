import numpy as np
from keras.preprocessing.text import Tokenizer
import random
import pydot
from keras import preprocessing
from keras.utils import plot_model
from keras.preprocessing.sequence import pad_sequences

from keras.models import Sequential 
from keras.layers import Flatten, Dense
from keras.layers import Embedding
from keras.layers import Dropout
from keras.layers import Input
from keras.models import Model
from keras.layers.merge import concatenate

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


# In[187]:



from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyser = SentimentIntensityAnalyzer()

def get_sentiment_scores(sentence):
    snt = analyser.polarity_scores(sentence)
    
    t_neg = snt['neg']

    t_pos = snt['pos']

    
    return [t_neg, t_pos]


all_data = pd.read_csv("svm.csv")

random_state_seed =  random.randint(0,999)

print("Seed "+str(random_state_seed))


# Retrieving GloVe Matrix

import pickle

embedding_matrix = pickle.load( open( "embedding_matrix.p", "rb" ) )

embedding_dim = 300
max_words = 10000
maxlen = 50


# In[191]:


matrix = np.array(all_data.iloc[:,0:7])
matrix_labels = np.array(all_data.iloc[:,7])





x_train, x_val, y_train, y_val = train_test_split(matrix, matrix_labels , test_size=0.2, random_state=89)

x_train_text = x_train[:,0]

x_train_tokens = Tokenize_tweets(x_train[:,0])
x_train =x_train[:,1:]

print(x_train[1])
print("\n")

#x_train[:,0] = x_tokens


x_val_text = x_val[:,0]


x_val_tokens = Tokenize_tweets(x_val[:,0])
x_val =x_val[:,1:]


# In[193]:


sent_x_train = []

for k in range(len(x_train_text)):
    sent_x_train.append(get_sentiment_scores(x_train_text[k]))

sent_x_train = np.array(sent_x_train)
    

    
sent_x_val = []

for k in range(len(x_val_text)):
    sent_x_val.append(get_sentiment_scores(x_val_text[k]))
    
sent_x_val = np.array(sent_x_val)


# In[205]:


def Add_Sentiment_To_Predictors(original_matrix, sentiment_matrix):

    n_rows, n_cols = original_matrix.shape

    temp_matrix = np.ones((n_rows,n_cols+2))

    for k in range(n_rows):
        temp_matrix[k,0:n_cols] = original_matrix[k, :]
        temp_matrix[k,n_cols] = sentiment_matrix[k,0]
        temp_matrix[k,n_cols+1] = sentiment_matrix[k,1]

    return temp_matrix


# In[208]:


x_train = Add_Sentiment_To_Predictors(x_train, sent_x_train)
x_val = Add_Sentiment_To_Predictors(x_val, sent_x_val)



token_cols = x_train_tokens.shape[1]
others_cols = x_train.shape[1]

tokens = Input(shape= (token_cols,) , name = 'token_input' )
others = Input(shape= (others_cols,) , name = 'others_input')


emb_out = Embedding( max_words, embedding_dim, input_length=maxlen, name = 'glove_embeddings')(tokens) 

#emb_layer =  model.get_layer("wea")



flat1 = Flatten()(emb_out)

hidden1 = Dense(100, activation='relu', name = 'dense_tokens')(flat1)
#hidden1 = Dropout(.2)(hidden1)

hidden2 = Dense(100, activation='relu', name = 'dense_user_info')(others)
#hidden2 = Dropout(.2)(hidden2)

# merge feature extractors
merge = concatenate([hidden1, hidden2])

# interpretation layer
hidden3 = Dense(10, activation='relu', name = 'joining')(merge)
#hidden3 = Dropout(.2)(hidden3)

# prediction output
output = Dense(1, activation='sigmoid')(hidden3)
model = Model(inputs=[tokens, others], outputs=output)

model.layers[1].set_weights([embedding_matrix])
model.layers[1].trainable = False

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['acc'])


print(model.summary())


history = model.fit([x_train_tokens, x_train], y_train, epochs=10, batch_size=16, validation_data=([x_val_tokens, x_val], y_val) )



 
raw_propensities = model.predict([x_val_tokens,x_val])


#random_state_seed = random.randint(0,999)
rand_id = str(random_state_seed)

id_tag = "B"+rand_id


filename = id_tag+"  raw propensities.p"

pickle.dump( raw_propensities, open( '../results/'+filename, "wb" ) )

filename = id_tag+ 'new_sexism_classifier.h5'
model.save('../results/'+filename)


filename = id_tag+" last_history.p"
pickle.dump( history.history, open('../results/'+filename, "wb" ) )



used_dataset = [x_train,x_val, y_train, y_val]


filename = id_tag+" used_dataset.p"

pickle.dump( used_dataset, open( '../results/'+filename, "wb" ) )
print("--- %s seconds ---" % (time.time() - start_time))
