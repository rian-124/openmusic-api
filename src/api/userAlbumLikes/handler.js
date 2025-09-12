const autoBind = require('auto-bind');

class UserAlbumLikesHandler {
  constructor(albumsService, service) {
    this._service = service;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postLikeAlbumIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.verifyAlbumId(albumId);

    await this._service.addLikeAlbumId({ userId, albumId });

    const response = h.response({
      status: 'success',
      message: 'Successfully added likes album',
    });

    response.code(201);

    return response;
  }

  async deleteLikeAlbumIdHandler(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteLikeAlbumId({ userId, albumId });

    return {
      status: 'success',
      message: 'successfully unlike album',
    };
  }

  async getCountLikesAlbumIdHandler(request, h) {
    const { id: albumId } = request.params;

    const { count, cache } = await this._service.getCountLikesAlbumId(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: count,
      },
    });

    if (cache) {
      response.header('X-data-source', 'cache');
    }

    return response;
  }
}

module.exports = UserAlbumLikesHandler;
