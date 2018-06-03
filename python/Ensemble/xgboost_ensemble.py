from numpy import loadtxt
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.metrics import confusion_matrix
import pickle
# load data

svm_table = pd.read_csv("svm.csv")
# split data into X and y

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

# split data into train and test sets

test_size = 0.2

# fit model no training data
model = XGBClassifier()
model.fit(X_df_train, Y_df_train)
# make predictions for test data
y_pred = model.predict(X_df_test)

xgboost_score = model.score(X_df_test,Y_df_test)

#Save the SVM as either (svm_xgboost.sav) or (svm_poly.sav), (svm_linear.sav)
pickle.dump(model,open("model.sav",'wb'))


# evaluate predictions

xgboost_tn, xgboost_fp, xgboost_fn, xgboost_tp = confusion_matrix(Y_df_test, y_pred).ravel()

with open("xgboost.txt", "w") as f_xgboost:
    f_xgboost.write("accu: "+str(xgboost_score)+"\n")
    f_xgboost.write(str(xgboost_tn) +" " + str(xgboost_fp) + " " + str(xgboost_fn) + " " + str(xgboost_tp)+"\n")
    tpr = float(xgboost_tp / (xgboost_tp + xgboost_fn))
    tnr = float(xgboost_tn / (xgboost_tn + xgboost_fp))

    f_xgboost.write("TPR: " + str(tpr)+"\n")
    f_xgboost.write("TNR: " + str(tnr)+"\n")
    f_xgboost.write("FPR: " + str(1-tpr)+"\n")
    f_xgboost.write("FNR: " + str(1-tnr)+"\n")
    f_xgboost.write("FDR: " + str(float(xgboost_fp/(xgboost_fp+xgboost_tp)))+"\n")
    f_xgboost.write("FOR: " + str(float(xgboost_fn/(xgboost_fn+xgboost_tn)))+"\n")

    f_xgboost.write("random seed: "+str(random_state_seed))
