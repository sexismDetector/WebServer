# from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import numpy as np
import pandas as pd
from sklearn.svm import SVC
import pickle
from vaderSentiment import SentimentIntensityAnalyzer


#read SVM.csv from /res directory.
svm_table = pd.read_csv("/res/SVM.csv") #x1~x6 data is obtained as a result.


row_count = svm_table.shape[0]   # shape returns a tuple of (rows, cols)  ==> shape[0] means num of rows

x7 = []

#compute x7: sentimental value
analyzer = SentimentIntensityAnalyzer()
for tweet in svm_table["text"]:  # run vaderSentiment on all tweets
    vs = analyzer.polarity_scores(tweet)
    x7.append(vs)


#use numpy to bond x7 column to the pd
result_table = pd.concat([svm_table, x7], axis= 1, sort=False) # keep the order as is

#run SVM on the pd
svm_fit_rbf = SVC(kernel='rbf')
svm_fit_lnr = SVC(kernel='linear')
svm_fit_poly = SVC(kernel='poly')
svm_fit_sig= SVC(kernel='sigmoid')
# text , x1 = urban , x2 = oxford , x3 = follower , x4 = favorite , x5 = friend , x6 = sexist words/ length ratio

X_df = result_table.loc[:,['x1','x2','x3','x4','x5','x6','x7']] # take everything from x1 ~x7 as our X, and fit it to 'label'
# Note that  .loc[: , 'x1':'x7'] may not work because x7 was concatenated after 'label' col of the original .csv
Y_df = result_table[:,'label']


svm_rbf = svm_fit_rbf.fit(X_df, Y_df)
svm_lnr = svm_fit_lnr.fit(X_df, Y_df)
svm_poly = svm_fit_poly.fit(X_df, Y_df)
svm_sig = svm_fit_sig.fit(X_df, Y_df)



#Save the SVM as either (svm_rbf.sav) or (svm_poly.sav), (svm_linear.sav)
pickle.dump(svm_rbf,open("svm_rbf.sav",'wb'))
pickle.dump(svm_lnr,open("svm_lnr.sav",'wb'))
pickle.dump(svm_poly,open("svm_poly.sav",'wb'))
pickle.dump(svm_sig,open("svm_sig.sav",'wb'))

#To maintain the accuaracy info of each model saved as .sav, output [model_name].txt and
# inside the .txt file, print the accuracy score

