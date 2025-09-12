const UserAlbumLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'userAlbumLikes',
  version: '1.0.0',
  register: async (server, { albumsService, service }) => {
    const userAlbumLikesHandler = new UserAlbumLikesHandler(
      albumsService,
      service
    );

    server.route(routes(userAlbumLikesHandler));
  },
};
