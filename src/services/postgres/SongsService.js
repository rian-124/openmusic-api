const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, title, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album failed to be added');
    }

    return result.rows[0].id;
  }
}

module.exports = SongsService;
