import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from PostgreSQLConnector import PostgresConnector
import json
# Program that connects to  Urban Dictionary.com & oxford dictionary.com
#  to search for words and determine if each word is sexist or not


class UrbanDictCrawler:
    def __init__(self, fileName):     # format = 'json' or 'csv"
        self.session_urban = requests.session()
        self.fileName = fileName
        self.psql = PostgresConnector()
        self.conn = self.psql.connect()
        self.cur = self.conn.cursor()
        self.english_word_list = []
        # with open('words_dictionary.json') as english_dict:
        if fileName[-4:] == 'json':
            with open(fileName) as english_dict:
                d = json.load(english_dict)
                english_dict.close()
                self.english_word_list = d.keys()
        else:   # csv
            with open(fileName) as english_dict:
                self.csvFile = pd.read_csv(fileName)

    def crawl(self):
        url_urban = "https://www.urbandictionary.com/define.php?term="
        isSexist = 0
        # print("fine until line 32")
        if self.fileName[-4:] == 'json':
            for word in self.english_word_list:
                # print("fine until line 35")
                res = self.session_urban.get(url_urban + word)  # This is where we actually connect to the URL
                # print(res)
                soup = BeautifulSoup(res.text, "html.parser")  # this is where we use the html parser to parse


                if soup.find_all('a',href="/category.php?category=sex"):  # if there exists at least 1 definition of the word that is labeled as sexist, (the anchor tags <a> that has the attr href= ~)
                    stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 1 WHERE word = \'{}\'".format(word)
                    isSexist = 1
                # else :
                #     stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 0 WHERE word = {}".format(word)
                #     print(word +": "+ str(isSexist))
                    self.cur.execute(stmt)
                    self.conn.commit()
                    time.sleep(0.2)

        else:      # in case of the csv file,
            for row_index, key_val in self.csvFile.iterrows():
                # url_urban += key_val
                # url_oxford += key_val
                res = self.session_urban.get(url_urban + str(key_val[0]))  # This is where we actually connect to the URL
                soup = BeautifulSoup(res.text, "html.parser")  # this is where we use the html parser to parse
                if soup.find_all('a',href="/category.php?category=sex"):  # if there exists at least 1 definition of the word that is labeled as sexist, (the anchor tags <a> that has the attr href= ~)
                    stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 1 WHERE word = \'{}\'".format(key_val[0])
                    isSexist = 1
                # else :
                #     stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 0 WHERE word = {}".format(key_val[0])
                    print(key_val[0] + ": " + isSexist)
                    self.cur.execute(stmt)
                    self.conn.commit()
                    time.sleep(0.2)


