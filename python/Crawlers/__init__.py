from UrbanDictCrawler import UrbanDictCrawler
from OxfordDictCrawler import OxfordDictCrawler
from MerriamWebsterDictCrawl import MerriamWebsterDictCrawler
from OxfordDictCrawler_reverse import OxfordDictCrawlerReverse

# udc1 = UrbanDictCrawler('words_dictionary.json')
# udc2 = UrbanDictCrawler('sexist_tokens.csv')
# odc = OxfordDictCrawler('words_dictionary.json')
odcr = OxfordDictCrawlerReverse('words_dictionary.json')
# mwdc = MerriamWebsterDictCrawler('words_dictionary_original.json')



# udc1.crawl()
# udc2.crawl()
# odc.crawl()
odcr.crawl()
# mwdc.crawl()

