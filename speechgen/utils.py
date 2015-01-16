import random

def num_wiggle(num):
    wiggle = 1
    return random.randrange(num - wiggle, num + wiggle)

def join_dicts(dicts, ignore=''):
    common = set.intersection(*(set(d.keys()) for d in dicts))
    return {k:tuple(d[k] for d in dicts) for k in common if k != ignore}

def weighted_avg(vals, weights):
    return sum([v*w for v,w in zip(vals,weights)]) / sum(weights)

def parse_weight_string(ws):
    for i in xrange(0, len(ws), 3):
        yield (ws[i:i+2], int(ws[i+2]))

def retokenize(output_list):
    try:
        balance_quote = False
        output_string = output_list[0].title()
        for position, word in enumerate(output_list[1:]):
            add_string = ''
            previous_char = output_string[-1]
            pre_space = True
            
            if word == '~SENT~':
                continue
            elif u"\u0060\u0060" in word.encode('utf8'):
                word = '"'
                pre_space = True
                balance_quote = True
            elif "''" in word:
                if balance_quote:
                    word = '"'
                    pre_space = False
                    balance_quote = False
                else:
                    continue
            elif previous_char == '$':
                pre_space = False
            elif previous_char == '"':
                if output_string[-2] != " ":
                    pre_space = True
                else:
                    pre_space = False
            elif word.isalnum():
                pre_space = True
            elif word in ['Dr.', 'Mr.', 'Mrs.', 'M.', '$']:
                pre_space = True
            elif (word[0].isalnum()) and (word[-1].isalnum()) and (('-' in word) or ('.' in word)or (',' in word)):
                pre_space = True
            elif word[:-1].isalpha():
                pre_space = True
            elif not previous_char.isalnum():
                pre_space = True
            else:
                pre_space = False

            if pre_space:
                add_string += ' '

            add_string += word
            output_string += add_string
        if balance_quote:
            output_string += '"'
    except UnicodeDecodeError:
        new_list = [w.decode('latin1').encode('utf8') for w in output_list]
        retokenize(new_list)
    return output_string.replace('& mdash;','')

def get_random_id_weight_string(statistics):
    id_weight_string = ""
    for s in statistics:
        id_weight_string += s['id']
        id_weight_string += str(random.randrange(0,5))
    return id_weight_string

def make_model_fname(prez_number, ngram_order):
    prez_number = unicode(prez_number).zfill(2)
    return '{n}_{o}_gram_model.pickle'.format(n=prez_number, o=ngram_order)

def make_stubs_fname(prez_number):
    prez_number = unicode(prez_number).zfill(2)
    return '{n}_stubs.pickle'.format(n=prez_number,)
