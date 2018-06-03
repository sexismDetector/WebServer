import os
import sys, json, numpy as np
import pickle
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import xgboost
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

    # xgboost = load_trained_SVM(os.path.dirname(os.path.abspath(__file__)) +"/model.sav")


    # return pd.Series({
    #     "urban_score": urban_sexist,
    #     "oxford_score": oxford_sexist,
    #     "follower_score": followers_count,
    #     "favorite_score": favorites_count,
    #     "friend_score": friends_count,
    #     "sex_words_ratio" : sex_words_ratio,
    #     "posneg": posneg,
    #     "compound" : compound}
    #     # 0: urban_sexist,
    #     # 1: oxford_sexist,
    #     # 2: followers_count,
    #     # 3: favorites_count,
    #     # 4: friends_count,
    #     # 5: sex_words_ratio,
    #     # 6: posneg,
    #     # 7: compound}
    # )
    # return np.array([urban_sexist,oxford_sexist,followers_count,favorites_count,friends_count,sex_words_ratio,posneg,compound], dtype = np.float32)
    # df = pd.Series([urban_sexist, oxford_sexist, followers_count, favorites_count, friends_count, sex_words_ratio, posneg,compound]).to_frame()
    # df = pd.DataFrame(columns=["urban_score", "oxford_score", "follower_score", "favorite_score", "friend_score", "sex_words_ratio", "posneg", "compound"])
    df = pd.DataFrame(columns=["f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7"])

    df.loc[0] = [urban_sexist, oxford_sexist, followers_count, favorites_count, friends_count, sex_words_ratio, posneg, compound]
    # df.columns = ["urban_score", "oxford_score", "follower_score", "favorite_score", "friend_score", "sex_words_ratio", "posneg", "compound"]
    return df

def load_trained_SVM(filename):

    #load the trained SVM from pickle here.
    #this is run only once per process.
    loaded_model = pickle.load(open(filename, 'rb'))

    return loaded_model



if __name__ == '__main__':


    # load SVM and wait for the Node.JS module input
    txtSVM = load_trained_SVM(os.path.dirname(os.path.abspath(__file__)) +"/model2.sav")

    while True:
        # print(
        #     txtSVM.predict_proba(parse_info(read_in()))
        # )
        k = parse_info(read_in())
        # k = k["urban_score","oxford_score","follower_score","favorite_score","friend_score","sex_words_ratio","posneg","compound"]
        # k.reshape(-1,1)
        # print(k)
        # prob_of_not_sexist = txtSVM.predict_proba(xgboost.DMatrix(data = k, feature_names= ["urban_score", "oxford_score", "follower_score", "favorite_score", "friend_score", "sex_words_ratio", "posneg", "compound"]))[0][0] #
        # prob_of_not_sexist = txtSVM.predict_proba(xgboost.DMatrix(k.values))[0][0] #
        prob_of_not_sexist = txtSVM.predict_proba(k.values.reshape(1, -1))[0][0]

        print(1-prob_of_not_sexist)
        sys.stdout.flush()

