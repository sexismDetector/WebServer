from UrbanDictCrawler import UrbanDictCrawler
# from OxfordDictCrawler import OxfordDictCrawler


udc1 = UrbanDictCrawler('words_dictionary.json')
# udc2 = UrbanDictCrawler('sexist_token.csv')
# odc = OxfordDictCrawler('words_dictionary.json')


udc1.crawl()
# udc2.crawl()
# odc.crawl()


