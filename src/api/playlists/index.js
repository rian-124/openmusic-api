const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: (
    server,
    {
      playlistActivitiesService,
      playlistsService,
      playlistSongsService,
      validator,
    }
  ) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistActivitiesService,
      playlistsService,
      playlistSongsService,
      validator
    );

    server.route(routes(playlistsHandler));
  },
};
