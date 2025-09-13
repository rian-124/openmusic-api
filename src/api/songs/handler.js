const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { title, year, performer, genre, duration, albumId } =
      request.payload;

    const songId = await this._service.addSong({
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'Successfully added songs',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const { songs, cache } = await this._service.getSongs({ title, performer });

    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });

    if (cache) {
      response.header('X-data-source', 'cache');
    }

    return response;
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const { song, cache }= await this._service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });

    if (cache) {
      response.header('X-data-source', 'cache');
    }

    return response;
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Song successfully updated',
    };
  }

  async deleteSongHandler(request) {
    const { id } = request.params;

    await this._service.deleteSong(id);

    return {
      status: 'success',
      message: 'Album successfully deleted',
    };
  }
}

module.exports = SongsHandler;
