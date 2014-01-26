import requests
import re
import os
from lxml.cssselect import CSSSelector
from lxml.etree import fromstring, HTMLParser

# MAIN_SOTU_URL = 'http://www.presidency.ucsb.edu/sou.php'
MAIN_SOTU_FILE = 'index_table.html'

def main():
	# db = dataset.connect('sqlite:///sotu.sqlite')
	# table = db['sotu']

	# index = requests.get(MAIN_SOTU_URL)	

	parser = HTMLParser()
	f = open(MAIN_SOTU_FILE, 'r')
	h = fromstring(f.read(), parser)
	f.close()

	sel_table_tr = CSSSelector('table tr')
	sel_td = CSSSelector('td')
	sel_a = CSSSelector('a')

	current_president = None
	for row in sel_table_tr(h):
		tds = sel_td(row)
		if len(tds)==7:
			if tds[0].text is not None:
				current_president = str(tds[0].text).strip()
		
		for td in tds:
			for link in sel_a(td):
				if re.match(r'\d{4}', str(link.text)) is not None:

					

					print 'fetching %s / %s / %s' % (current_president, link.text, link.attrib['href'])
					html = requests.get(link.attrib['href']).text
					html = html.split('<span class="displaytext">')[1]
					html = html.split('<hr noshade="noshade"')[0]				
					html = html.replace('<p>', "\n")
					html = re.sub(r'<[^>]*>', '', html)
					
					if not os.path.exists('./text/%s' % current_president):
						os.mkdir('./text/%s' % current_president)
					f = open('./text/%s/%4d' % (current_president, int(link.text)), 'w')
					f.write(html.encode('utf-8'))
					f.close()

					# sel_displaytext = CSSSelector('.displaytext')
					# h = fromstring( parser)
					# print sel_displaytext(h)[0].text

if __name__ == '__main__':
	main()