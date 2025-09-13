// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const config = require('./utils/config.js');
const inert = require('@hapi/inert');

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

// playlists
const playlist = require('./api/playlists/index.js');
const PlaylistsService = require('./services/postgres/PlaylistsService.js');
const { PlaylistsValidator } = require('./validation/playlists/index.js');

// playlistSongs
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService.js');

// playlistActivities
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService.js');

// storage
const StorageService = require('./services/storageService/StorageService.js');
const UploadsValidator = require('./validation/uploads/index.js');

// userAlbumLikes
const userAlbumLikes = require('./api/userAlbumLikes/index.js');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService.js');

// collaboration
const collaborations = require('./api/collaborations/index.js');
const {
  CollaborationsValidator,
} = require('./validation/collaborations/index.js');
const CollaborationsService = require('./services/postgres/CollaborationsService.js');

// chache
const CacheService = require('./services/redis/CacheService.js');

// errorHandling
const ClientError = require('./exceptions/ClientError.js');

const init = async () => {
  const authenticationsService = new AuthenticationsService();
  const cacheService = new CacheService();
  const usersService = new UsersService();
  const albumsService = new AlbumsService(cacheService);
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/albums/file/images')
  );
  const songsService = new SongsService(cacheService);
  const playlistActivitiesService = new PlaylistActivitiesService();
  const collaborationsService = new CollaborationsService(usersService);
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService(songsService);
  const userAlbumLikesService = new UserAlbumLikesService(cacheService);
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
    },
  ]);

  server.auth.strategy('musicsapp_jwt', 'jwt', {
    keys: config.jwt.key,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.maxAgeSec,
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
    {
      plugin: userAlbumLikes,
      options: {
        albumsService,
        service: userAlbumLikesService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

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
