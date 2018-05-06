import pandas as pd
import requests
# import urllib.request
from bs4 import BeautifulSoup
import time
from PostgreSQLConnector import PostgresConnector
import json
import re


class OxfordDictCrawlerReverse:

    def __init__(self, fileName):
        self.proc_words = {}    # html files that were already processed
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
                english_word_list = list(d.keys())
                english_word_list.sort()
                self.english_word_list = english_word_list[::-1]
        else:  # csv
            with open(fileName):
                self.csvFile = pd.read_csv(fileName)

    def crawl(self):
        url_oxford = "https://en.oxforddictionaries.com/definition/"

        if self.fileName[-4:] == 'json':
            for word in self.english_word_list:
                # print("fine until line 35")
                found_page = False
                while True:
                    res = self.session_oxford.get(url_oxford + word)  # This is where we actually connect to the URL
                    # print(res)
                    soup = BeautifulSoup(res.text, "html.parser")  # this is where we use the html parser to parse
                    wordFirstLetter = word[:1] + '*'
                    # if len(soup.find_all('span', class_="hw", text=re.compile(wordFirstLetter, re.IGNORECASE))) >= 1: found_page = True
                    if res.status_code == 200: found_page = True
                    else: continue  # continue on within the while loop, with the same word

                    numOfVulgar_Slang = len(soup.find_all('span', class_="sense-registers", text="vulgar slang "))
                    if numOfVulgar_Slang > 0: print(word + " vulgar_slang: " + str(numOfVulgar_Slang))
                    numOfDerogatory=0

                    numOfInformal_Offensive=0
                    if len(soup.find_all('span', class_="ind",text=re.compile(
                            r'(female)|\b(male)|(wo)?m(a|e)n|(person)|(girl)|(boy)|(gender)|(homosexual)'))) >=1:
                        numOfInformal_Offensive = len(soup.find_all('span', class_="sense-registers", text="informal, offensive "))
                        print(word +" Informal_Offensive: " + str(numOfInformal_Offensive))
                        dero = soup.find_all('span', class_="sense-registers", text="derogatory")
                        numOfDerogatory = len(dero)
                        print(word+ " derogatory: " + str(numOfDerogatory))

                    numOfDef = numOfInformal_Offensive + numOfDerogatory + numOfVulgar_Slang
                    if numOfDef >= 1:  # if there exists at least 1 definition of the word that is labeled as sexist, (the anchor tags <a> that has the attr href= ~)
                        stmt = "UPDATE \"LabeledWords\" SET oxford_sexist = {} WHERE word = \'{}\'".format(numOfDef,
                                                                                                          word)

                        # else :
                        #     stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 0 WHERE word = {}".format(word)
                        print(word + ": " + str(numOfDef))
                        self.cur.execute(stmt)
                        self.conn.commit()
                        time.sleep(0.2)
                    if found_page: break

        else:  # in case of the csv file,
            for row_index, key_val in self.csvFile.iterrows():
                # url_urban += key_val
                # url_oxford += key_val
                print(key_val)
                res = self.session_oxford.get(
                    url_oxford + str(key_val[1]))  # This is where we actually connect to the URL
                soup = BeautifulSoup(res.text, "html.parser")  # this is where we use the html parser to parse
                numOfDef = len(soup.find_all('a', href="/category.php?category=sex"))
                if numOfDef > 1:  # if there exists at least 1 definition of the word that is labeled as sexist, (the anchor tags <a> that has the attr href= ~)
                    stmt = "insert into \"LabeledWords\" (word, urban_sexist, oxford_sentimental, oxford_sexist) select " \
                           "\'{}\', 0, 0,0 where not exists (select * from \"LabeledWords\" where word = \'{}\');" \
                           "UPDATE \"LabeledWords\" SET oxford_sexist = {} WHERE word = \'{}\'".format(key_val[1],
                                                                                                      key_val[1],
                                                                                                      numOfDef - 1,
                                                                                                      key_val[1])
                    # else :
                    #     stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 0 WHERE word = {}".format(key_val[0])
                    print(key_val[1] + ": " + str(numOfDef - 1))
                    self.cur.execute(stmt)
                    self.conn.commit()
                    time.sleep(0.2)
        # if self.fileName[-4:] == 'json':
        #     for word in self.english_word_list:
        #         fullQuery = url_oxford + word
        #         request = requests.get(fullQuery)
        #         # res = self.url_oxford.get(url_oxford + word)  # This is where we actually connect to the URL
        #         try:
        #             response = urllib.request.urlopen(request)
        #
        #             soup = BeautifulSoup(request.text, "html.parser")  # this is where we use the html parser to parse
        #
        #             if soup.find_all('a',href="/category.php?category=sex"):  # if there exists at least 1 definition of the word that is labeled as sexist, (the anchor tags <a> that has the attr href= ~)
        #                 stmt= "UPDATE \"LabeledWords\" SET oxford_sexist = 1 WHERE word = \'{}\'".format(word)
        #             # else :
        #                 # stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 0 WHERE word = {}".format(word)
        #                 self.cur.execute(stmt)
        #                 self.conn.commit()
        #                 time.sleep(0.2)
        #
        # else:      # in case of the csv file,
        #     for row_index, key_val in self.csvFile.iterrows():
        #         # url_urban += key_val
        #         # url_oxford += key_val
        #         res = self.session_oxford.get(url_oxford + str(key_val[0]))  # This is where we actually connect to the URL
        #         soup = BeautifulSoup(res.text, "html.parser")  # this is where we use the html parser to parse
        #         for element in  soup.find_all('span', class_="sense-registers"):
        #             stmt= "UPDATE \"LabeledWords\" SET oxford_sexist = 1 WHERE word = \'{}\'".format(key_val[0])
        #         # else :
        #         #   stmt= "UPDATE \"LabeledWords\" SET urban_sexist = 0 WHERE word = {}".format(key_val[0])
        #         self.cur.execute(stmt)
        #         self.conn.commit()
        #         time.sleep(0.2)






