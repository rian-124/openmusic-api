const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{id}',
    handler: handler.postExportPlaylistHandler,
    options: {
      auth: 'musicsapp_jwt',
    },
  },
];

module.exports = routes;
