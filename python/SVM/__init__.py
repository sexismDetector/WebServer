import sys, json, numpy as np
import pickle
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


def parse_info(info):
    tweet = info[0]
    demographics = info[1]
    text = tweet["text"]
    user_id = demographics["user_id"]
    screen_name = demographics["screen_name"]
    followers_count = demographics["followers_count"]
    favorites_count = demographics["favorites_count"]

    # tsvm = TextSVM(text, user_id, screen_name, followers_count, favorites_count)
    return text, user_id, screen_name, followers_count, favorites_count
    # tsvm.predict()
    # return tsvm.predict()

def load_trained_SVM(filename):

    #load the trained SVM from pickle here.
    #this is run only once per process.
    loaded_model = pickle.load(open(filename, 'rb'))

    return loaded_model



if __name__ == '__main__':

    # load SVM and wait for the Node.JS module input
    txtSVM = load_trained_SVM("svm_rbf.sav")

    while True:   
        print(txtSVM.predict(parse_info(read_in())))
        sys.stdout.flush()
