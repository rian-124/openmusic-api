const autoBind = require('auto-bind');
const { config } = require('../../utils');

class AlbumsHandler {
  constructor(
    albumsService,
    albumsValidator,
    storageService,
    uploadsValidator
  ) {
    this._albumsService = albumsService;
    this._albumsValidator = albumsValidator;
    this._storageService = storageService;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album successfully added',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async postCoverByAlbumIdHandler(request, h) {
    const { cover } = request.payload;
    console.log(cover);
    this._uploadsValidator.validateImageHeadersPayload(cover.hapi.headers);

    const { id: albumId } = request.params;

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;

    console.log(albumId);

    await this._albumsService.addCoverAlbumId({ albumId, cover: fileLocation });

    const response = h.response({
      status: 'success',
      message: 'Successfully uploaded cover.',
    });

    response.code(201);

    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);

    return {
      status: 'success',
      message: 'Successfully retreived album ID',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album successfully updated',
    };
  }

  async deleteAlbumHandler(request) {
    const { id } = request.params;

    await this._albumsService.deleteAlbum(id);

    return {
      status: 'success',
      message: 'Album successfully deleted',
    };
  }
}

module.exports = AlbumsHandler;
