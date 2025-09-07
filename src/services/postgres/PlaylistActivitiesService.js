const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    await this._pool.query(query);
  }

  async getActivities(playlistId) {
    const query = {
      text: `
        SELECT users.username, songs.title, a.action, a.time
        FROM playlist_song_activities a
        JOIN users ON a.user_id = users.id
        JOIN songs ON a.song_id = songs.id
        WHERE a.playlist_id = $1
        ORDER BY a.time ASC
      `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistActivitiesService;
