import sys, json, numpy as np
import pickle
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas
# get the input from Node Server through stdin



# return the folowing info:
    # 1st line----json string {"text":  string type , "hashtags": string array }
    # 2nd line----json string {"user_id" , "screen_name", "followers_count" , "favorites_count"}



def read_in():
    line1 = sys.stdin.readline()

    tweet = json.loads(line1)
    #tweet = json.load(sys.stdin)

    line2 = sys.stdin.readline()
    demographics = json.loads(line2)
    #demographics = json.load(sys.stdin)


    return tweet, demographics



# execute classification to print!! 0(not sexist) or 1(sexist)

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
    return pos-neg, compound

def parse_info(info):
    tweet = info[0]
    demographics = info[1]
    text = tweet["text"]
    user_id = demographics["user_id"]
    screen_name = demographics["screen_name"]
    followers_count = demographics["followers_count"]
    favorites_count = demographics["favorites_count"]
    urban_sexist = demographics["urban_score"]
    oxford_sexist = demographics["oxford_score"]
    sex_words_ratio = demographics["sex_words_ratio"]

    posneg , compound = calculate_senti(text)

    # return text, user_id, screen_name, followers_count, favorites_count
    return pd.Series(urban_sexist, oxford_sexist, followers_count, favorites_count, sex_words_ratio, posneg, compound)

def load_trained_SVM(filename):

    #load the trained SVM from pickle here.
    #this is run only once per process.
    loaded_model = pickle.load(open(filename, 'rb'))

    return loaded_model



if __name__ == '__main__':


    # load SVM and wait for the Node.JS module input
    txtSVM = load_trained_SVM("svm_rbf.sav")

    while True:
        # print(
        #     txtSVM.predict_proba(parse_info(read_in()))
        # )
        prob_of_not_sexist = txtSVM.predict_proba(parse_info(read_in()))[0][0]
        print(1-prob_of_not_sexist)
        sys.stdout.flush()

