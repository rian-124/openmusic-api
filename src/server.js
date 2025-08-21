require('dotenv').config();
const Hapi = require('@hapi/hapi');
const songs = require('./api/songs/index.js');
const ClientError = require('./exceptions/ClientError.js');
const SongsService = require('./services/postgres/SongsService.js');
const albums = require('./api/albums/index.js');
const AlbumsService = require('./services/postgres/AlbumsService.js');
const AlbumsValidator = require('./validation/index.js');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator,
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();

  console.log(`Server running on ${server.info.uri}`);
};

init();
