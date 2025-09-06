class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    console.log(request.payload);
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;

    const { id: credentialsId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({
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
    const playlists = await this._service.getPlaylists({ owner: credentialsId });

    return {
      status: 'success',
      message: 'successfully retreived playlist',
      data: {
        playlists,
      },
    };
  }
}

module.exports = PlaylistsHandler;
