import datetime
import os
import uuid

import rq_settings
from flask import Flask, jsonify, render_template, request
from raven.contrib.flask import Sentry
from redis import Redis
from rq import Queue
from sfapp.blueprint import sfapp


#
# set up Redis connection and rq queue
#

redis_conn = Redis(host=rq_settings.REDIS_HOST,
                   port=rq_settings.REDIS_PORT,
                   password=rq_settings.REDIS_PASSWORD)
rq = Queue('archive', connection=redis_conn)


#
# create app
#

app = Flask(__name__)
app.register_blueprint(sfapp)

# Sentry configuration

app.config['SENTRY_DSN'] = os.environ.get('SENTRY_DSN')
sentry = Sentry(app)


#
# the routes
#

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/generate', methods=['GET'])
def generate():
    guid = uuid.uuid4().hex[:8]
    iws = request.args.get('iws', '423')
    speech = {
        'id': guid,
        'iws': iws,
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'content': [],
    }
    rq.enqueue('tasks.archive_speech', speech)
    return jsonify(speech)


if __name__ == '__main__':
    app.run(debug=True, port=8000)
