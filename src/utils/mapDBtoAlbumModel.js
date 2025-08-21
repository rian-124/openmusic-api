
/* eslint-disable camelcase */
const mapDBToAlbumModel = ({ id, name, year, created_at, updated_at }) => ({
  id,
  name,
  year,
  created_at: created_at,
  updated_at: updated_at,
});

module.exports = mapDBToAlbumModel;
