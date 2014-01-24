import json
import os

from boto.s3.connection import S3Connection
from boto.s3.key import Key
from pymongo import MongoClient


mongo = MongoClient(os.environ.get('MONGOHQ_URL'))
db = mongo.app21542251

s3 = S3Connection(os.environ.get('AWS_KEY'), os.environ.get('AWS_SECRET'))
s3_bucket = s3.get_bucket(os.environ.get('AWS_BUCKET'))


def archive_speech(speech):

    hsh = speech['id']

    path = "speeches/%s/%s/%s/%s.json" % (hsh[:1], hsh[1:2], hsh[2:3], hsh[3:])
    speech['path'] = path

    k = Key(s3_bucket)
    k.key = path
    k.set_contents_from_string(json.dumps(speech), headers={'Content-Type': 'application/json'})
    k.set_acl('public-read')

    db.speeches.insert(speech)
