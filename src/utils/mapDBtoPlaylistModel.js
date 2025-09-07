const mapDBToPlaylistModel = (rows) => {
  if (!rows.length) return null;

  return {
    id: rows[0].id,
    name: rows[0].name,
    username: rows[0].username,
    songs: rows
      .filter((row) => row.song_id)
      .map((row) => ({
        id: row.song_id,
        title: row.title,
        performer: row.performer,
      })),
  };
};

module.exports = mapDBToPlaylistModel;
