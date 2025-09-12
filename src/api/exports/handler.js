class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistService = playlistsService;
    this._validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPayload(request.payload);

    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, owner);

    const message = {
      playlistId: playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage(
      'export:playlist',
      JSON.stringify(message)
    );

    const response = h.response({
      status: 'success',
      message: 'Your request is being processed.',
    });

    response.code(201);

    return response;
  }
}

module.exports = ExportsHandler;
