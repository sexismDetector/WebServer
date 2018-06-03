import numpy as np
from sklearn.ensemble import VotingClassifier

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
from sklearn.model_selection import *
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
import pickle
import os

def load_trained_SVM(filename):

    #load the trained SVM from pickle here.
    #this is run only once per process.
    loaded_model = pickle.load(open(filename, 'rb'))

    return loaded_model
# pip install "h5py==2.8.0rc1"
print("hi")
if __name__ == '__main__':
    print("line 25")
    rbf = load_trained_SVM("../SVM/svm_rbf.sav")
    lnr = load_trained_SVM("../SVM/svm_lnr.sav")


    ### CODE FOR X.df Y.df

    # read SVM.csv from /res directory.
    svm_table = pd.read_csv("svm.csv")  # x1~x6 data is obtained as a result.

    # row_count = svm_table.shape[0]   # shape returns a tuple of (rows, cols)  ==> shape[0] means num of rows

    # print(svm_table)
    # x7 = pd.DataFrame(columns=["neg", "neu", "pos", "compound"])
    # print(svm_table.isnull().sum().sum())
    x7_df = pd.DataFrame(columns=["posneg", "compound"])

    # compute x7: sentimental value
    analyzer = SentimentIntensityAnalyzer()
    for tweet in svm_table["text"]:  # run vaderSentiment on all tweets
        senti = analyzer.polarity_scores(tweet)
        # print(neg)
        neg = senti['neg']
        neu = senti['neu']
        pos = senti['pos']
        compound = senti['compound']
        new_series = pd.Series([pos - neg, compound], index=["posneg", "compound"])
        # print("new:")
        # print(new_series)
        # dict1.update({"neg" : neg, "pos" : pos, "compound" : compound})
        x7_df = x7_df.append(new_series,ignore_index=True)  # CAUTION !!! pandas' df.append is not in-place appending, so has to return by = operator

    result_table = pd.concat([svm_table, x7_df], axis=1)  # keep the order as is

    # SVM_models = []


    # text , x1 = urban , x2 = oxford , x3 = follower , x4 = favorite , x5 = friend , x6 = sexist words/ length ratio
    # 'some_sexist_word'   ==> urbandictionary def with sexual connotations 7 ==> 7 * #occurence in tweet 6 = 7 * 6 =42
    # X_df = result_table.loc[:,['urban_score','oxford_score','follower_score','favorite_score','friend_score','sex_words_ratio','x7']] # take everything from x1 ~x7 as our X, and fit it to 'label'
    # X_df = result_table[list(result_table.columns[1:6]result_table.columns[7]] # take everything from x1 ~x7 as our X, and fit it to 'label'
    # print(result_table)

    # X_df = result_table[['urban_score','oxford_score','follower_score','favorite_score','friend_score','sex_words_ratio','neg','neu', 'pos', 'compound']]
    X_df = result_table[
        ['urban_score', 'oxford_score', 'follower_score', 'favorite_score', 'friend_score', 'sex_words_ratio', 'posneg',
         'compound']]

    # print(X_df)

    # Note that  .loc[: , 'x1':'x7'] may not work because x7 was concatenated after 'label' col of the original .csv
    Y_df = result_table[['label']]

    # the reason I specified the random_state int is because I want to split of the df to be reproducible.
    # For future reference, I am saving the value of random_state_seed along with the accuracy info in [model].txt.

    random_state_seed = 89 # produce random integer [0, 100]
    X_df_train, X_df_test, Y_df_train, Y_df_test = train_test_split(X_df, Y_df, test_size=0.2, random_state=random_state_seed)



    ###

    # Y_df_train = Y_df_train.loc[:,"label"]

    vclf1 = VotingClassifier(estimators=[('rbf', rbf), ('lnr', lnr)], voting='hard')
    vclf1 = vclf1.fit(X_df_train, Y_df_train)

    vclf2 = VotingClassifier(estimators=[('rbf', rbf), ('lnr', lnr)], voting='soft')
    vclf2 = vclf2.fit(X_df_train, Y_df_train)

    vclf1_predicted = vclf1.predict(X_df_test)
    vclf2_predicted = vclf2.predict(X_df_test)

    # Y_df_test = Y_df_test.loc[:,"label"]
    # CAUTION: the .score method per se uses the prediction from  the SVC object that went through .fit() internally.
    vclf1_score = vclf1.score(X_df_test,Y_df_test)
    vclf2_score = vclf2.score(X_df_test,Y_df_test)

    #Save the SVM as either (svm_rbf.sav) or (svm_poly.sav), (svm_linear.sav)
    pickle.dump(vclf1,open("vclf1.sav",'wb'))
    pickle.dump(vclf2,open("vclf2.sav",'wb'))


    #computing confusion matrix
    vclf1_tn, vclf1_fp, vclf1_fn, vclf1_tp = confusion_matrix(Y_df_test, vclf1_predicted).ravel()
    vclf2_tn, vclf2_fp, vclf2_fn, vclf2_tp = confusion_matrix(Y_df_test, vclf2_predicted).ravel()

    #To maintain the accuaracy info of each model saved as .sav, output [model_name].txt and
    # inside the .txt file, print the accuracy score
    with open("vclf1.txt", "w") as f_rbf:
        f_rbf.write("accu: "+str(vclf1_score)+"\n")
        f_rbf.write(str(vclf1_tn) +" " + str(vclf1_fp) + " " + str(vclf1_fn) + " " + str(vclf1_tp)+"\n")
        tpr = float(vclf1_tp / (vclf1_tp + vclf1_fn))
        tnr = float(vclf1_tn / (vclf1_tn + vclf1_fp))

        f_rbf.write("TPR: " + str(tpr)+"\n")
        f_rbf.write("TNR: " + str(tnr)+"\n")
        f_rbf.write("FPR: " + str(1-tpr)+"\n")
        f_rbf.write("FNR: " + str(1-tnr)+"\n")
        f_rbf.write("FDR: " + str(float(vclf1_fp/(vclf1_fp+vclf1_tp)))+"\n")
        f_rbf.write("FOR: " + str(float(vclf1_fn/(vclf1_fn+vclf1_tn)))+"\n")

        f_rbf.write("random seed: "+str(random_state_seed))


    with open("vclf2.txt", "w") as f_rbf:
        f_rbf.write("accu: "+str(vclf2_score)+"\n")
        f_rbf.write(str(vclf2_tn) +" " + str(vclf2_fp) + " " + str(vclf2_fn) + " " + str(vclf2_tp)+"\n")
        tpr = float(vclf2_tp / (vclf2_tp + vclf2_fn))
        tnr = float(vclf2_tn / (vclf2_tn + vclf2_fp))

        f_rbf.write("TPR: " + str(tpr)+"\n")
        f_rbf.write("TNR: " + str(tnr)+"\n")
        f_rbf.write("FPR: " + str(1-tpr)+"\n")
        f_rbf.write("FNR: " + str(1-tnr)+"\n")
        f_rbf.write("FDR: " + str(float(vclf2_fp/(vclf2_fp+vclf2_tp)))+"\n")
        f_rbf.write("FOR: " + str(float(vclf2_fn/(vclf2_fn+vclf2_tn)))+"\n")

        f_rbf.write("random seed: "+str(random_state_seed))

