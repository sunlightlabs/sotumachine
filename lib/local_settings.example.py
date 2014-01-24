import os, sys

PROJECT_ROOT = os.path.realpath(os.path.dirname(__file__))

TEXT_DIR = os.path.join(os.getcwd(),'SOTU/sotu/text')
LANG_MODEL_DIR = os.path.join(os.getcwd(), 'language_models')

def make_model_fname(prez_number, ngram_order):
    prez_number = unicode(prez_number).zfill(2)
    return '{n}_{o}_gram_model.pickle'.format(n=prez_number, o=ngram_order)
