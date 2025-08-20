require("dotenv").config();
const Hapi = require("@hapi/hapi");
const musics = require("./api/musics/index.js");
const ClientError = require("./exceptions/ClientError.js");
const MusicsService = require("./services/postgres/MusicsService.js");

const init = async () => {
  const musicsService = new MusicsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register({
    plugin: musics,
    options: {
        service: musicsService,
    },
  });

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();

  console.log(`Server running on ${server.info.uri}`);
};

init();
