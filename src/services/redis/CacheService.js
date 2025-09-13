const redis = require('redis');
const { config } = require('../../utils');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    this._client.on('error', (error) => {
      console.error(error);
    });

    this._client.connect();

    this._expirationInSecond = 1800;
  }

  async set(key, value, expirationInSecond = this._expirationInSecond) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);

    if (result === null) throw new Error('Chache not found');

    return result;
  }

  async del(key) {
    return this._client.del(key);
  }

  async deleteByPattern(pattern) {
    const keys = await this._client.keys(pattern);

    if (keys.length > 0) {
      await this._client.del(keys);
    }
  }
}

module.exports = CacheService;
