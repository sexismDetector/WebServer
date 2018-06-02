# from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import numpy as np
import pandas as pd
from sklearn.svm import SVC
from sklearn.model_selection import *
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
import pickle
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import os.path
# from pathlib import Path

# csv_file = Path("X_df.csv")



if os.path.isfile("X_df.csv") is not True:


    #read SVM.csv from /res directory.
    svm_table = pd.read_csv("svm.csv") #x1~x6 data is obtained as a result.


    # row_count = svm_table.shape[0]   # shape returns a tuple of (rows, cols)  ==> shape[0] means num of rows

    # print(svm_table)
    # x7 = pd.DataFrame(columns=["neg", "neu", "pos", "compound"])
    # print(svm_table.isnull().sum().sum())
    x7_df = pd.DataFrame(columns=["posneg", "compound"])

    #compute x7: sentimental value
    analyzer = SentimentIntensityAnalyzer()
    for tweet in svm_table["text"]:  # run vaderSentiment on all tweets
        senti = analyzer.polarity_scores(tweet)
        # print(neg)
        neg = senti['neg']
        neu = senti['neu']
        pos = senti['pos']
        compound = senti['compound']
        new_series = pd.Series([pos-neg, compound], index=["posneg", "compound"])
        # print("new:")
        # print(new_series)
        # dict1.update({"neg" : neg, "pos" : pos, "compound" : compound})
        x7_df = x7_df.append(new_series, ignore_index=True)   # CAUTION !!! pandas' df.append is not in-place appending, so has to return by = operator
        # print(x7_df)

    # x7_df = pd.DataFrame(x7)

    # x7_series = pd.Series(x7)

    # print(x7_df)
    # print(x7_df.isnull().values.any())
    #use numpy to bond x7 column to the pd
    result_table = pd.concat([svm_table, x7_df], axis= 1) # keep the order as is

    # SVM_models = []


    # text , x1 = urban , x2 = oxford , x3 = follower , x4 = favorite , x5 = friend , x6 = sexist words/ length ratio
    # 'some_sexist_word'   ==> urbandictionary def with sexual connotations 7 ==> 7 * #occurence in tweet 6 = 7 * 6 =42
    # X_df = result_table.loc[:,['urban_score','oxford_score','follower_score','favorite_score','friend_score','sex_words_ratio','x7']] # take everything from x1 ~x7 as our X, and fit it to 'label'
    # X_df = result_table[list(result_table.columns[1:6]result_table.columns[7]] # take everything from x1 ~x7 as our X, and fit it to 'label'
    # print(result_table)

    # X_df = result_table[['urban_score','oxford_score','follower_score','favorite_score','friend_score','sex_words_ratio','neg','neu', 'pos', 'compound']]
    X_df = result_table[['urban_score','oxford_score','follower_score','favorite_score','friend_score','sex_words_ratio','posneg', 'compound']]

    # print(X_df)

    # Note that  .loc[: , 'x1':'x7'] may not work because x7 was concatenated after 'label' col of the original .csv
    Y_df = result_table[['label']]

    # the reason I specified the random_state int is because I want to split of the df to be reproducible.
    # For future reference, I am saving the value of random_state_seed along with the accuracy info in [model].txt.

    X_df.to_csv('X_df.csv')
    Y_df.to_csv('Y_df.csv')

else:  # if it had run before
    X_df = pd.read_csv("X_df.csv")
    Y_df = pd.read_csv("Y_df.csv")

random_state_seed = 89#np.random.random_integers(0, 100) # produce random integer [0, 100]
X_df_train, X_df_test, Y_df_train, Y_df_test = train_test_split(X_df, Y_df, test_size=0.2, random_state=random_state_seed)

# print(X_df.isnull().values.any())

#run SVM on the pd

svm_fit_rbf = SVC(kernel='rbf', probability=True)
svm_fit_lnr = SVC(kernel='linear', probability=True)
svm_fit_poly = SVC(kernel='poly', probability=True)
svm_fit_sig= SVC(kernel='sigmoid', probability=True)

Y_df_train = Y_df_train.loc[:,"label"]

svm_rbf = svm_fit_rbf.fit(X_df_train, Y_df_train)
svm_lnr = svm_fit_lnr.fit(X_df_train, Y_df_train)
svm_poly = svm_fit_poly.fit(X_df_train, Y_df_train)
svm_sig = svm_fit_sig.fit(X_df_train, Y_df_train)

# rbf_score = cross_val_predict(svm_rbf,X_df_test,Y_df_test)
# lnr_score = cross_val_predict(svm_lnr,X_df_test,Y_df_test)
# poly_score = cross_val_predict(svm_poly,X_df_test,Y_df_test)
# sig_score = cross_val_predict(svm_sig,X_df_test,Y_df_test)

#The below are needed for using the Confusion matrix method.
rbf_predicted = svm_rbf.predict(X_df_test)
lnr_predicted = svm_lnr.predict(X_df_test)
poly_predicted = svm_poly.predict(X_df_test)
sig_predicted = svm_sig.predict(X_df_test)

Y_df_test =Y_df_test.loc[:,"label"]

# CAUTION: the .score method per se uses the prediction from  the SVC object that went through .fit() internally.
# rbf_score = svm_rbf.score(X_df_test,Y_df_test.loc[:,"label"])
# lnr_score = svm_lnr.score(X_df_test,Y_df_test.loc[:,"label"])
# poly_score = svm_poly.score(X_df_test,Y_df_test.loc[:,"label"])
# sig_score = svm_sig.score(X_df_test,Y_df_test.loc[:,"label"])
rbf_score = svm_rbf.score(X_df_test,Y_df_test)
lnr_score = svm_lnr.score(X_df_test,Y_df_test)
poly_score = svm_poly.score(X_df_test,Y_df_test)
sig_score = svm_sig.score(X_df_test,Y_df_test)

#Save the SVM as either (svm_rbf.sav) or (svm_poly.sav), (svm_linear.sav)
pickle.dump(svm_rbf,open("svm_rbf.sav",'wb'))
pickle.dump(svm_lnr,open("svm_lnr.sav",'wb'))
pickle.dump(svm_poly,open("svm_poly.sav",'wb'))
pickle.dump(svm_sig,open("svm_sig.sav",'wb'))

#computing confusion matrix
rbf_tn, rbf_fp, rbf_fn, rbf_tp = confusion_matrix(Y_df_test, rbf_predicted).ravel()
lnr_tn, lnr_fp, lnr_fn, lnr_tp = confusion_matrix(Y_df_test, lnr_predicted).ravel()
poly_tn, poly_fp, poly_fn, poly_tp = confusion_matrix(Y_df_test, poly_predicted).ravel()
sig_tn, sig_fp, sig_fn, sig_tp = confusion_matrix(Y_df_test, sig_predicted).ravel()





#To maintain the accuaracy info of each model saved as .sav, output [model_name].txt and
# inside the .txt file, print the accuracy score
with open("svm_rbf.txt", "w") as f_rbf:
    f_rbf.write("accu: "+str(rbf_score)+"\n")
    f_rbf.write(str(rbf_tn) +" " + str(rbf_fp) + " " + str(rbf_fn) + " " + str(rbf_tp)+"\n")
    tpr = float(rbf_tp / (rbf_tp + rbf_fn))
    tnr = float(rbf_tn / (rbf_tn + rbf_fp))

    f_rbf.write("TPR: " + str(tpr)+"\n")
    f_rbf.write("TNR: " + str(tnr)+"\n")
    f_rbf.write("FPR: " + str(1-tpr)+"\n")
    f_rbf.write("FNR: " + str(1-tnr)+"\n")
    f_rbf.write("FDR: " + str(float(rbf_fp/(rbf_fp+rbf_tp)))+"\n")
    f_rbf.write("FOR: " + str(float(rbf_fn/(rbf_fn+rbf_tn)))+"\n")

    f_rbf.write("random seed: "+str(random_state_seed))


with open("svm_lnr.txt", "w") as f_rbf:
    f_rbf.write("accu: "+ str(lnr_score)+"\n")
    f_rbf.write(str(lnr_tn) + " " + str(lnr_fp) + " " + str(lnr_fn) + " " + str(lnr_tp)+"\n")
    tpr = float(lnr_tp / (lnr_tp + lnr_fn))
    tnr = float(lnr_tn / (lnr_tn + lnr_fp))

    f_rbf.write("TPR: " + str(tpr)+"\n")
    f_rbf.write("TNR: " + str(tnr)+"\n")
    f_rbf.write("FPR: " + str(1-tpr)+"\n")
    f_rbf.write("FNR: " + str(1-tnr)+"\n")
    f_rbf.write("FDR: " + str(float(lnr_fp/(lnr_fp+lnr_tp)))+"\n")
    f_rbf.write("FOR: " + str(float(lnr_fn/(lnr_fn+lnr_tn)))+"\n")
    f_rbf.write(str(random_state_seed))

with open("svm_poly.txt", "w") as f_rbf:
    f_rbf.write("accu: "+ str(poly_score)+"\n")
    f_rbf.write(str(poly_tn) + " " + str(poly_fp) + " " + str(poly_fn) + " " + str(poly_tp)+"\n")
    tpr = float(poly_tp / (poly_tp + poly_fn))
    tnr = float(poly_tn / (poly_tn + poly_fp))

    f_rbf.write("TPR: " + str(tpr)+"\n")
    f_rbf.write("TNR: " + str(tnr)+"\n")
    f_rbf.write("FPR: " + str(1-tpr)+"\n")
    f_rbf.write("FNR: " + str(1-tnr)+"\n")
    f_rbf.write("FDR: " + str(float(poly_fp/(poly_fp+poly_tp)))+"\n")
    f_rbf.write("FOR: " + str(float(poly_fn/(poly_fn+poly_tn)))+"\n")
    f_rbf.write(str(random_state_seed))

with open("svm_sig.txt", "w") as f_rbf:
    f_rbf.write("accu: "+ str(sig_score)+"\n")
    f_rbf.write(str(sig_tn) + " " + str(sig_fp) + " " + str(sig_fn) + " " + str(sig_tp)+"\n")
    tpr = float(sig_tp / (sig_tp + sig_fn))
    tnr = float(sig_tn / (rbf_tn + sig_fp))

    f_rbf.write("TPR: " + str(tpr)+"\n")
    f_rbf.write("TNR: " + str(tnr)+"\n")
    f_rbf.write("FPR: " + str(1-tpr)+"\n")
    f_rbf.write("FNR: " + str(1-tnr)+"\n")
    f_rbf.write("FDR: " + str(float(sig_fp/(sig_fp+sig_tp)))+"\n")
    f_rbf.write("FOR: " + str(float(sig_fn/(sig_fn+sig_tn)))+"\n")
    f_rbf.write(str(random_state_seed)+"\n")


