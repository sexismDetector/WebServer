
#  load the SVM model from pickle

#

class TextSVM():

    def __init__(self, text,user_id, screen_name, followers_count, favorites_count):
        print("{}{}{}{}{}".format(text, user_id, screen_name, followers_count, favorites_count))

    def predict(self):
        print("working properly")