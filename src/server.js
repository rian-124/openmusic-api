// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');

// songs
const songs = require('./api/songs/index.js');
const SongsService = require('./services/postgres/SongsService.js');
const { SongsValidator } = require('./validation/songs/index.js');

// albums
const albums = require('./api/albums/index.js');
const AlbumsService = require('./services/postgres/AlbumsService.js');
const { AlbumsValidator } = require('./validation/albums/index.js');

// users
const users = require('./api/users/index.js');
const UsersService = require('./services/postgres/UsersService.js');
const { usersValidator } = require('./validation/users/index.js');

// exports
const _exports = require('./api/exports/index.js');
const ExportsValidator = require('./validation/exports/index.js');
const ProducerService = require('./services/rabbitmq/producerService.js');

// authentications
const authentications = require('./api/authentications/index.js');
const AuthenticationsService = require('./services/postgres/AuthenticationsService.js');
const TokenManager = require('./tokenize/TokenManager.js');
const {
  AuthenticationsValidator,
} = require('./validation/authentications/index.js');

// errorHandling
const ClientError = require('./exceptions/ClientError.js');
const playlist = require('./api/playlists/index.js');
const PlaylistsService = require('./services/postgres/PlaylistsService.js');
const { PlaylistsValidator } = require('./validation/playlists/index.js');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService.js');
const collaborations = require('./api/collaborations/index.js');
const {
  CollaborationsValidator,
} = require('./validation/collaborations/index.js');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService.js');
const CollaborationsService = require('./services/postgres/CollaborationsService.js');
const config = require('./utils/config.js');
const StorageService = require('./services/storageService/StorageService.js');
const UploadsValidator = require('./validation/uploads/index.js');
const inert = require('@hapi/inert');

const init = async () => {
  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
  const albumsService = new AlbumsService();
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/albums/file/images')
  );
  const songsService = new SongsService();
  const playlistActivitiesService = new PlaylistActivitiesService();
  const collaborationsService = new CollaborationsService(usersService);
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService(songsService);
  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: inert,
    }
  ]);

  server.auth.strategy('musicsapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
        albumsService,
        albumsValidator: AlbumsValidator,
        storageService,
        uploadsValidator: UploadsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        playlistActivitiesService,
        playlistsService,
        playlistSongsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        playlistsService,
        producerService: ProducerService,
        validator: ExportsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    console.log(response);

    if (response instanceof Error) {
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
