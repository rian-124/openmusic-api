const config = require('./config');
const mapDBToAlbumModel = require('./mapDBtoAlbumModel');
const mapDBToPlaylistModel = require('./mapDBtoPlaylistModel');
const mapDBToSongModel = require('./mapDBToSongModel');

module.exports = {
  config,
  mapDBToAlbumModel,
  mapDBToSongModel,
  mapDBToPlaylistModel
};
