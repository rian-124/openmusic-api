const SongsHandler = require("./handler");
const routes = require('./routes');

module.exports = {
  name: "songs",
  version: "1.0.0",
  register: async (server, { services }) => {
    const songsHandler = new SongsHandler(services);

    server.route(routes(songsHandler));
  },
};
