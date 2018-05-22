# from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import numpy as np
import pandas as pd
from sklearn.svm import SVC
from sklearn.model_selection import *
from sklearn.metrics import accuracy_score
import pickle
from vaderSentiment import SentimentIntensityAnalyzer


#read SVM.csv from /res directory.
svm_table = pd.read_csv("../../res/SVM.csv") #x1~x6 data is obtained as a result.


# row_count = svm_table.shape[0]   # shape returns a tuple of (rows, cols)  ==> shape[0] means num of rows

x7 = []

#compute x7: sentimental value
analyzer = SentimentIntensityAnalyzer()
for tweet in svm_table["text"]:  # run vaderSentiment on all tweets
    vs = analyzer.polarity_scores(tweet)
    x7.append(vs)


#use numpy to bond x7 column to the pd
result_table = pd.concat([svm_table, x7], axis= 1, sort=False) # keep the order as is

# SVM_models = []

#run SVM on the pd

svm_fit_rbf = SVC(kernel='rbf', probability=True)
svm_fit_lnr = SVC(kernel='linear', probability=True)
svm_fit_poly = SVC(kernel='poly', probability=True)
svm_fit_sig= SVC(kernel='sigmoid', probability=True)
# text , x1 = urban , x2 = oxford , x3 = follower , x4 = favorite , x5 = friend , x6 = sexist words/ length ratio
# 'some_sexist_word'   ==> urbandictionary def with sexual connotations 7 ==> 7 * #occurence in tweet 6 = 7 * 6 =42
X_df = result_table.loc[:,['x1','x2','x3','x4','x5','x6','x7']] # take everything from x1 ~x7 as our X, and fit it to 'label'
# Note that  .loc[: , 'x1':'x7'] may not work because x7 was concatenated after 'label' col of the original .csv
Y_df = result_table[:,'label']

# the reason I specified the random_state int is because I want to split of the df to be reproducible.
# For future reference, I am saving the value of random_state_seed along with the accuracy info in [model].txt.
random_state_seed = np.random.random_integers(0, 100) # produce random integer [0, 100]
X_df_train, X_df_test, Y_df_train, Y_df_test = train_test_split(X_df, Y_df, test_size=0.2, random_state=random_state_seed)

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

# CAUTION: the .score method per se uses the prediction from  the SVC object that went through .fit() internally.
rbf_score = svm_rbf.score(X_df_test,Y_df_test)
lnr_score = svm_lnr.score(X_df_test,Y_df_test)
poly_score = svm_poly.score(X_df_test,Y_df_test)
sig_score = svm_sig.score(X_df_test,Y_df_test)


#Save the SVM as either (svm_rbf.sav) or (svm_poly.sav), (svm_linear.sav)
pickle.dump(svm_rbf,open("svm_rbf.sav",'wb'))
pickle.dump(svm_lnr,open("svm_lnr.sav",'wb'))
pickle.dump(svm_poly,open("svm_poly.sav",'wb'))
pickle.dump(svm_sig,open("svm_sig.sav",'wb'))

#To maintain the accuaracy info of each model saved as .sav, output [model_name].txt and
# inside the .txt file, print the accuracy score
with open("svm_rbf.txt", "w") as f_rbf:
    f_rbf.write(rbf_score)

with open("svm_lnr.txt", "w") as f_rbf:
    f_rbf.write(rbf_score)

with open("svm_rbf.txt", "w") as f_rbf:
    f_rbf.write(rbf_score)

with open("svm_rbf.txt", "w") as f_rbf:
    f_rbf.write(rbf_score)



