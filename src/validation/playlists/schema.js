const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistSongSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeletePlaylistSongsSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PlaylistPayloadSchema,
  PlaylistSongSchema,
  DeletePlaylistSongsSchema,
};
