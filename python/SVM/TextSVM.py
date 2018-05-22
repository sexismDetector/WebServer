import sys




class TextSVM():

    def __init__(self, trained):
        # print("{}{}{}{}{}".format(text, user_id, screen_name, followers_count, favorites_count))
        self.trainedSVM = trained  # typeof trained is a SVM obj



    def predict(self, text, user_id, screen_name, follwers_count, favorites_count):
        # print("working properly")
        print(trained.predict())




        sys.stdout.flush()   # in order to pass the content of print() to our Node.JS server, we have to flush at the end.