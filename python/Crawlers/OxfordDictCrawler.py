import pandas as pd
import requests
from bs4 import BeautifulSoup
import time
from PostgreSQLConnector import PostgresConnector
import json


class OxfordDictCrawler:

    def __init__(self, fileName):
        self.proc_files = {}    # html files that were already processed
        self.session_oxford = requests.session()
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
        else:  # csv
            with open(fileName) as english_dict:
                self.csvFile = pd.read_csv(fileName)

    def crawl(self):
        url_oxford = "https://en.oxforddictionaries.com/definition/"

        if self.fileName[-4:] == 'json':
            for word in self.english_word_list:
                res = self.session_oxford.get(url_oxford + word)  # This is where we actually connect to the URL
                soup = BeautifulSoup(res.text, "html.parser")  # this is where we use the html parser to parse

                if soup.find_all('a',href="/category.php?category=sex"):  # if there exists at least 1 definition of the word that is labeled as sexist, (the anchor tags <a> that has the attr href= ~)
                    stmt= "UPDATE \"LabeledWords\" SET oxford_sexist = 1 WHERE word = \'{}\'".format(word)
                # else :
                    # stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 0 WHERE word = {}".format(word)
                    self.cur.execute(stmt)
                    self.conn.commit()
                    time.sleep(0.2)

        else:      # in case of the csv file,
            for row_index, key_val in self.csvFile.iterrows():
                # url_urban += key_val
                # url_oxford += key_val
                res = self.session_oxford.get(url_oxford + str(key_val[0]))  # This is where we actually connect to the URL
                soup = BeautifulSoup(res.text, "html.parser")  # this is where we use the html parser to parse
                for element in  soup.find_all('span', class_="sense-registers"):
                    stmt= "UPDATE \"LabeledWords\" SET oxford_sexist = 1 WHERE word = \'{}\'".format(key_val[0])
                # else :
                #   stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 0 WHERE word = {}".format(key_val[0])
                self.cur.execute(stmt)
                self.conn.commit()
                time.sleep(0.2)






