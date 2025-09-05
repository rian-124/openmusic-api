require('dotenv').config();
const Hapi = require('@hapi/hapi');
const songs = require('./api/songs/index.js');
const ClientError = require('./exceptions/ClientError.js');
const SongsService = require('./services/postgres/SongsService.js');
const albums = require('./api/albums/index.js');
const AlbumsService = require('./services/postgres/AlbumsService.js');
const { AlbumsValidator } = require('./validation/albums/index.js');
const { SongsValidator } = require('./validation/songs/index.js');
const UsersService = require('./services/postgres/UsersService.js');
const users = require('./api/users/index.js');
const { usersValidator } = require('./validation/users/index.js');
const authentications = require('./api/authentications/index.js');
const AuthenticationsService = require('./services/postgres/AuthenticationsService.js');
const TokenManager = require('./tokenize/TokenManager.js');
const {
  AuthenticationsValidator,
} = require('./validation/authentications/index.js');

const init = async () => {
  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
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

  await server.register([
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: usersValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      console.error(response);
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }

      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'Ups! something wrong with our server',
      });
      newResponse.code(500);
      return newResponse;
    }

    // jika bukan error, lanjutkan dengan response sebelumnya
    return h.continue;
  });

  await server.start();

  console.log(`Server running on ${server.info.uri}`);
};

init();
