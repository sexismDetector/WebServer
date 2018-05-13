import sys, json, numpy as np
from TextSVM import TextSVM

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


def run_SVM(info):
    tweet = info[0]
    demographics = info[1]
    text = tweet["text"]
    user_id = demographics["user_id"]
    screen_name = demographics["screen_name"]
    followers_count = demographics["followers_count"]
    favorites_count = demographics["favorites_count"]

    tsvm = TextSVM(text, user_id, screen_name, followers_count, favorites_count)

    tsvm.predict()
    # return tsvm.predict()



if __name__ == '__main__':


    run_SVM(read_in())