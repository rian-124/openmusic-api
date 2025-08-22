const mapDBToSongModel = (row) =>
  Object.fromEntries(
    Object.entries(row).filter(([key, value]) => value !== null) // eslint-disable-line no-unused-vars
  );

module.exports = mapDBToSongModel;
