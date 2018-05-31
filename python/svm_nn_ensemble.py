"""
Ensemble using SVM and NN for sexist commennts binary classification 

""" 
# For reading the json
import os
import sys, json

# For using the models
from sklearn.model_selection import *
from keras.wrappers.scikit_learn import KerasClassifier
from sklearn.ensemble import  VotingClassifier
import pandas
import pickle


script_path = os.path.dirname(os.path.abspath(__file__))

print("\t folder: " + script_path)

the_nn_model_path = script_path+  "/NN/nn_model.py"

os.chdir(the_nn_model_path)

rn = os.getcwd()
print("right now "+rn)
from  nn_model import nn_ensemble_model

os.chdir(script_path)



svm_path = script_path+"/SVM/svm_rbf.sav"

txtSVM  = pickle.load(open(svm_path, 'rb'))


#Creating sci-kit learn object for classifier voting
sk_nn_classifier = KerasClassifier(build_fn = nn_ensemble_model)

estimators = []
model1 = txtSVM
estimators.append(('svm', model1))
model2 = sk_nn_classifier
estimators.append(('nn', model2))

# create the Voting Classifier ensemble model
ensemble = VotingClassifier(estimators)


while True:

    #reading the jsons
    tweet = sys.stdin.readline()
    user = sys.stdin.readline()
    first_json = json.loads(tweet)
    #second_json = json.loads(user) 
    
    ### BEGINNING OF ESEMBLE CODE ###



    print(ensemble)



   
    #### END OF ENSEMBLE CODE ####
    sys.stdout.flush()
