const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToPlaylistModel } = require('../../utils');

class PlaylistSongsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  async addSongToPlaylist({ playlistId, songId }) {
    await this._songsService.verifySong(songId);

    const id = `playlistSongs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Song ID failed to be added into playlist.');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongs({ playlistId, owner }) {
    const query = {
      text: `
   SELECT playlists.id, playlists.name, users.username, songs.id AS song_id, songs.title, songs.performer FROM playlists JOIN users ON playlists.owner = users.id LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id LEFT JOIN songs ON playlist_songs.song_id = songs.id LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE playlists.id = $1 AND (playlists.owner = $2 OR collaborations.user_id = $2)
  `,
      values: [playlistId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist or owner not found');
    }

    return mapDBToPlaylistModel(result.rows);
  }

  async deletePlaylistSongs(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song not found in this playlist');
    }
  }
}

module.exports = PlaylistSongsService;
