import os
import urlparse

redis_config = urlparse.urlparse(os.environ.get('REDISCLOUD_URL'))

REDIS_HOST = redis_config.hostname
REDIS_PORT = redis_config.port
REDIS_PASSWORD = redis_config.password

QUEUES = ['archive']

SENTRY_DSN = os.environ.get('SENTRY_DSN')
