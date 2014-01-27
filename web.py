import datetime
import json
import os
import uuid

import requests
from flask import Flask, Response, abort, jsonify, render_template, request
from raven.contrib.flask import Sentry
from redis import Redis
from rq import Queue
from sfapp.blueprint import sfapp

import settings
from speechgen.utils import get_random_id_weight_string


#
# set up Redis connection and rq queue
#

redis_conn = Redis(host=settings.REDIS_HOST,
                   port=settings.REDIS_PORT,
                   password=settings.REDIS_PASSWORD)
rq = Queue('archive', connection=redis_conn)


#
# create app
#

app = Flask(__name__)
app.config['DEBUG'] = os.environ.get('DEBUG', False)
app.register_blueprint(sfapp)

# Sentry configuration

app.config['SENTRY_DSN'] = os.environ.get('SENTRY_DSN')
sentry = Sentry(app)


#
# speech generation and utilities
#

with open(settings.STATS_PATH) as infile:
    speech_stats = json.load(infile)

speech_writer = None

def get_speech_writer():
    global speech_writer
    if not speech_writer:
        from speechgen.models import SpeechWriter
        speech_writer = SpeechWriter(settings.STATS_PATH)
    return speech_writer

if not app.config['DEBUG']:
    get_speech_writer()


#
# the routes
#

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/generate', methods=['GET'])
def generate_speech():

    guid = uuid.uuid4().hex[:8]
    iws = request.args.get('iws')

    if not iws:
        return abort(404)

    writer = get_speech_writer()
    content = [p for p in writer.generate_speech(iws, citations=True)]

    speech = {
        'id': guid,
        'iws': iws,
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'content': content,
    }
    rq.enqueue('tasks.archive_speech', speech)
    return jsonify(speech)

@app.route('/iws', methods=['GET'])
def random_iws():
    return get_random_id_weight_string(speech_stats)

@app.route('/s/<speech_id>', methods=['GET'])
def speech_proxy(speech_id):
    if request.is_xhr:
        path = '%s/%s/%s/%s.json' % (speech_id[0], speech_id[1], speech_id[2], speech_id[3:])
        url = 'http://sotumachine.s3.amazonaws.com/speeches/%s' % path
        resp = requests.get(url)
        return Response(resp.content, mimetype='application/json')
    else:
        return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True, port=8000)
