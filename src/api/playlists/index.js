const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: (server, { playlistsService, playlistSongsService, validator }) => {
    const playlistsHandler = new PlaylistsHandler(playlistsService, playlistSongsService, validator);

    server.route(routes(playlistsHandler));
  },
};
