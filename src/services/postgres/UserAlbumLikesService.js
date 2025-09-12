const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();

    this._cacheService = cacheService;
  }

  async addLikeAlbumId({ userId, albumId }) {
    await this.verifyUserLikes(userId, albumId);
    const id = `userAlbumLikes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to added likes album');
    }

    this._cacheService.del(`album:${albumId}`);

    return result.rows[0].id;
  }

  async getCountLikesAlbumId(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}`);

      return {
        count: JSON.parse(result),
        cache: true,
      };
    } catch {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      const count = Number(result.rows[0].count);

      await this._cacheService.set(`album:${albumId}`, JSON.stringify(count));

      return {
        count,
        cache: false,
      };
    }
  }

  async verifyUserLikes(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('User already likes this album.');
    }
  }

  async deleteLikeAlbumId({ userId, albumId }) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed unlike album, like not found');
    }

    await this._cacheService.del(`album:${albumId}`);
  }
}

module.exports = UserAlbumLikesService;
