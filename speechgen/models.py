import cPickle
import random
import sys, os
import json
import operator

from datetime import datetime
from glob import glob
from collections import Iterable

import nltk

from settings import LANG_MODEL_DIR

from utils import num_wiggle, parse_weight_string, weighted_avg, join_dicts, retokenize, make_model_fname

class President(object):
    _default_preamble = ['My', 'Fellow', 'Americans', ',']

    def __init__(self, ngram_pickle, personal_stats):
        if isinstance(ngram_pickle, basestring):
            _ngram_file = open(ngram_pickle)
        else:
            _ngram_file = ngram_pickle
        self._ngram_model = cPickle.load(_ngram_file)
        self._stats = personal_stats
        self.ngram_order = self._ngram_model._n
        self.window_length = 6

    @property
    def avg_para_length(self):
        # give average paragraph length (in sentences)
        return self._stats['avg_para_length']

    @property
    def avg_speech_length(self):
        # give average speech length (in paragraphs)
        return self._stats['avg_speech_length']

    @property
    def stats(self):
        return self._stats

    @property
    def preamble(self):
        #return self._stats.get('preamble', self._generate_preamble())
        if not 'preambles' in self._stats:
            return self._default_preamble
        else:
            text = random.choice(self._stats['preambles'])
            return nltk.word_tokenize(nltk.clean_html(text))

    def next_word(self, context):
        result = self._ngram_model.generate(1, context=context)
        window = min([self.window_length, len(result)])
        return (result[-window:], result[-1])

    def next_sent(self, context=None):
        sent = []
        while len(sent) < 6 or (not sent[0][0].isalpha()):
            sent = self.make_sent(context)
        return sent

    def make_sent(self, context):
        sent = []
        _context = context
        if not context:
            _context = self.preamble
            sent.extend(_context)
        nw = ""
        while nw != '~SENT~':
            _context, nw = self.next_word(_context)
            sent.append(nw)
        return sent

def make_presidents(stats, ngram_order=3, select=None):
    sys.stderr.write('assembling presidents...\n')
    presidents = {}
    if isinstance(stats, basestring):
        _stat_file = open(stats)
    else:
        _stat_file = stats
    if select:
        stat_dicts = [sd for sd in json.load(_stat_file) if sd['id'] in select]
    else:
        stat_dicts = json.load(_stat_file)
    for stat_dict in stat_dicts:
        prez_id = stat_dict['id']
        sys.stderr.write(stat_dict['name']+'...')
        model_fname = make_model_fname(prez_id, ngram_order)
        model_loc = os.path.join(LANG_MODEL_DIR, model_fname)
        if os.path.exists(model_loc):
            presidents[prez_id] = President(os.path.join(LANG_MODEL_DIR, model_fname), stat_dict)
        else:
            print model_loc
            raise Exception('no {order}-gram model found for {prez_id} ({prez_name})'.format(
                order=ngram_order, prez_id = prez_id, prez_name = stat_dict['name']))
        sys.stderr.write('loaded.\n')
    return presidents

class SpeechWriter(object):

    def __init__(self, stats, ngram_order=3, select_presidents=None,
            randomize=False):
        available_orders = list(set([int(os.path.basename(fname).split('_')[1]) for fname in
                glob(os.path.join(LANG_MODEL_DIR,'*.pickle'))]))
        if ngram_order not in available_orders:
            print available_orders
            raise Exception('Sorry, no {order}-gram models have been trained'.format(
                order=ngram_order))
        self._presidents = make_presidents(stats, ngram_order, select=select_presidents)
        self.stat_table = join_dicts([p.stats for p in self._presidents.values()],
                ignore='preambles')
        if randomize:
            self.weights = { prez_id : random.randrange(0,5) for prez_id in
                    self.stat_table['id'] }
        else:
            self.weights = { prez_id : 0 for prez_id in self.stat_table['id'] }
        self.speech_stats = {
                'avg_para_length': 4,
                'avg_speech_length': 69,
                }

    @property
    def principal(self):
        cands = []
        slist = sorted(self.weights.iteritems(), key=operator.itemgetter(1),
                    reverse=True)
        max_key,  max_val = slist[0]
        cands.append(max_key)
        for k,v in slist:
            if v == max_val:
                cands.append(k)
            else:
                break
        return random.choice(cands)

    def update_weights(self, id_weight_string):
        self.weights.update(dict(parse_weight_string(id_weight_string)))
        self.labelpopulation = [label for sublist in
                                    map(lambda(k,v): [k,] * v, self.weights.iteritems())
                                        for label in sublist]

    def update_stats(self):
        for key in self.speech_stats.keys():
            vals = self.stat_table[key]
            weights = tuple([self.weights[prez_id] for prez_id in
                    self.stat_table['id']])
            if sum(weights):
                w_avg = weighted_avg(self.stat_table[key], weights)
                self.speech_stats[key] = w_avg

    def generate_speech(self, id_weight_string, citations=False):
        self.update_weights(id_weight_string)
        self.update_stats()
        self.context = None

        for i in xrange(int(self.speech_stats['avg_speech_length'] * (1.0/3.0))):
            #great place to parallelize
            yield self.generate_paragraph(citations)

    def generate_paragraph(self, citations):
        paragraph = []
        prez_id = self.principal
        sentence = self._presidents[prez_id].next_sent(self.context)
        paragraph.append((prez_id, retokenize(sentence)))
        for i in xrange(num_wiggle(self.speech_stats['avg_para_length'])):
            self.context = sentence[-1:]
            sentence = self._presidents[prez_id].next_sent(self.context)
            if citations:
                paragraph.append((prez_id, retokenize(sentence)))
            else:
                paragraph.append(retokenize(sentence))
            prez_id = random.choice(self.labelpopulation)
        return paragraph

if __name__ == "__main__":
    sys.stderr.write("Starting demo...\n")
    sys.stderr.write("="*80+'\n')
    from utils import get_random_id_weight_string

    stats = json.load(open('stats.json'))
    iws = get_random_id_weight_string(stats)

    sw = SpeechWriter('stats.json')
    speech = sw.generate_speech(iws)

    sys.stderr.write("One Paragraph...\n\n")
    print speech.next()

    sys.stderr.write("Now with citations...\n\n")
    speech = sw.generate_speech(iws,citations=True)
    print speech.next()
