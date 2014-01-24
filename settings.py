import os
import sys
import urlparse

PROJECT_ROOT = os.path.realpath(os.path.dirname(__file__))


# Redis

redis_config = urlparse.urlparse(os.environ.get('REDISCLOUD_URL'))

REDIS_HOST = redis_config.hostname
REDIS_PORT = redis_config.port
REDIS_PASSWORD = redis_config.password


# rq

QUEUES = ['archive']


# Sentry

SENTRY_DSN = os.environ.get('SENTRY_DSN')


# SpeechWriter

STATS_PATH = os.path.join(PROJECT_ROOT, 'data', 'stats.json')
LANG_MODEL_DIR = os.path.join(PROJECT_ROOT, 'data', 'models')
TEXT_DIR = os.path.join(os.getcwd(),'SOTU/sotu/text')
