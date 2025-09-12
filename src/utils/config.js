const config = {
  app: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 5000,
  },
  jwt: {
    key: process.env.ACCESS_TOKEN_KEY || 'secret_default_key',
    maxAgeSec: process.env.ACCESS_TOKEN_AGE || 1800,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER || '127.0.0.1',
  },
  redis: {
    host: process.env.REDIS_SERVER || 'localhost',
  },
};

module.exports = config;
