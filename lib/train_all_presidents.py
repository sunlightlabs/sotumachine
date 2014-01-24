import sys
import os
import json
from glob import glob
import cPickle

from collections import defaultdict

import unicodedata

import nltk
from nltk.model.ngram import NgramModel
from nltk.probability import LidstoneProbDist

from local_settings import TEXT_DIR, LANG_MODEL_DIR, make_model_fname
from utils import weighted_avg

presidents = {
 'George Bush': 41,
 'George W. Bush': 43,
 'Barack Obama': 44,
 'William J. Clinton': 42,
 'Ronald Reagan': 40,
 'George Washington': 01,
 'Abraham Lincoln': 16,
 'Theodore Roosevelt': 26,
 'Thomas Jefferson' : 03,
 }

def est(fdist, bins): 
    return LidstoneProbDist(fdist, 0.2)

def check_prez_names(my_list):
    presidents = [name for name in os.listdir(TEXT_DIR) if os.path.isdir(os.path.join(text_dir,name))]
    for n in my_list:
        if n not in presidents:
            print "{} not in presidents!".format(n)
    
def tokenize_and_demarcate(raw_paragraph):
    sent_list = []
    for sent in nltk.sent_tokenize(raw_paragraph):
        add_sent = nltk.word_tokenize(sent)
        add_sent.append('~SENT~')
        sent_list.append(add_sent)
    #sent_list[-1][-1] = '~PARA~'
    return sent_list

def parse_transcript(transcript_filename):
    speech = []
    with open(transcript_filename) as transcript:
        for line in transcript:
            raw = nltk.clean_html(line.strip())
            if raw:
                speech.extend(tokenize_and_demarcate(raw))
    return speech

def first_paragraphs(name,prez_id):
    print name,'-',prez_id
    for transcript_filename in build_corpus(name):
        with open(transcript_filename) as transcript:
            raw = ''
            while not raw:
                line = transcript.readline()
                raw = nltk.clean_html(line.strip())
            print raw+'\n'
    raw_input('\nTo continue press enter')

def build_corpus(name):
    return glob(os.path.join(TEXT_DIR, name,'*'))

def train_model(corpus, order):
    speeches = []
    for transcript_filename in corpus:
        speeches.extend(parse_transcript(transcript_filename))
    ngram_model = NgramModel(order, speeches, estimator=est)
    return ngram_model

def pickle_model(ngram_model, prez_number):
    prez_number = unicode(prez_number).zfill(2)
    order = ngram_model._n
    model_fname = make_model_fname(prez_number, order)
    with open(os.path.join(LANG_MODEL_DIR, model_fname), 'wb') as modelfile:
        cPickle.dump(ngram_model, modelfile)

def train_all_models(presidents, n=3):
    if not os.path.exists(LANG_MODEL_DIR):
        os.mkdir(LANG_MODEL_DIR)
    for name,number in presidents.iteritems():
        ngram_model = train_model(build_corpus(name), n)
        pickle_model(ngram_model, number)

def avg_int(counts):        
    return int(float(sum(counts)) / float(len(counts)))

def get_stats(presidents):
    stat_dicts = []
    for (name, number) in presidents.iteritems():
        stat_dict = {}
        stat_dict.update({
            u'id': unicode(number).zfill(2),
            u'name': unicode(name)
            })
        corpus_list = build_corpus(name)
        num_speeches = len(corpus_list)
        para_lengths = defaultdict(int)
        sent_lengths = defaultdict(int)
        speech_lengths = defaultdict(int)
        for fname in corpus_list:
            with open(fname) as speech:
                para_count = 0
                for line in speech:
                    sent_count = 0
                    line = nltk.clean_html(line.strip())
                    if line:
                        para_count += 1
                        for sent in nltk.sent_tokenize(line):
                            sent_lengths[len(nltk.word_tokenize(sent))] += 1
                            sent_count += 1
                        para_lengths[sent_count] += 1
                speech_lengths[para_count] += 1
        stat_dict.update({
            u'avg_speech_length' : weighted_avg(speech_lengths.keys(),
                speech_lengths.values()),
            u'avg_para_length' : weighted_avg(para_lengths.keys(),
                para_lengths.values()),
            u'avg_sent_length' : weighted_avg(sent_lengths.keys(),
                sent_lengths.values()),
            })
        stat_dicts.append(stat_dict)
    json.dump(stat_dicts, open('stats.json','w'))


