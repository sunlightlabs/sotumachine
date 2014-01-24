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
    output_string = output_list[0].title()
    for word in output_list[1:]:
        add_string = ''
        previous_char = output_string[-1]
        pre_space = True
        if word == '~SENT~':
            continue
        elif word.isalnum():
            pre_space = True
        elif word in ['Dr.', 'Mr.', 'Mrs.', 'M.']:
            pre_space = True
        elif (word[0].isalnum()) and (word[-1].isalnum()) and (('-' in word) or ('.' in word)):
            pre_space = True
        elif word[-1] == ':':
            pre_space = True
        elif not previous_char.isalnum():
            pre_space = True
        else:
            pre_space = False
        
        if pre_space:
            add_string += ' '
        add_string += word
        output_string += add_string
    return output_string

def get_random_id_weight_string(statistics):
    id_weight_string = ""
    for s in statistics:
        id_weight_string += s['id']
        id_weight_string += str(random.randrange(0,5))
    return id_weight_string

