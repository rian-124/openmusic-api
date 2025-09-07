class PlaylistsHandler {
  constructor(playlistActivitiesService, playlistsService, playlistSongsService, validator) {
    this._playlistActivitiesService = playlistActivitiesService;
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getPlaylistsDetailsHandler =
      this.getPlaylistsDetailsHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
    this.deletePlaylistSongsHandler =
      this.deletePlaylistSongsHandler.bind(this);
    this.getPlaylistActivitiesHandler =
      this.getPlaylistActivitiesHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;

    const { id: credentialsId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner: credentialsId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist successfully added',
      data: {
        playlistId,
      },
    });

    response.code(201);

    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialsId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists({
      owner: credentialsId,
    });

    return {
      status: 'success',
      message: 'successfully retreived playlist',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { id: credentialsId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialsId);
    await this._playlistsService.deletePlaylist(playlistId);

    return {
      status: 'success',
      message: 'successfully deleted playlist',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);

    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialsId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialsId);

    const playlistSongsId = await this._playlistSongsService.addSongToPlaylist({
      playlistId,
      songId,
    });

    await this._playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId: credentialsId,
      action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Successfully added songs to playlist',
      data: {
        playlistSongsId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsDetailsHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialsId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(
      playlistId,
      credentialsId
    );
    const playlist = await this._playlistSongsService.getPlaylistSongs({
      playlistId,
      owner: credentialsId,
    });

    return {
      status: 'success',
      message: 'successfully retreived playlist',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongsHandler(request) {
    this._validator.validateDeletePlaylistSongsPayload(request.payload);
    const { id: credentialsId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId: songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialsId);
    await this._playlistSongsService.deletePlaylistSongs(playlistId, songId);

    await this._playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId: credentialsId,
      action: 'delete',
    });

    return {
      status: 'success',
      message: 'successfully deleted playlist',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._playlistActivitiesService.getActivities(
      playlistId
    );

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
