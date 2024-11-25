require("dotenv").config();
const config = require("./src/config");
const configureSockets = require("./src/config/socket.config");

async function startServer() {
  const app = await config();

  const PORT = process.env.PORT || 5050;

  const server = app.listen(PORT, process.env.HOST, () => {
    console.log(`Server is running on https://${process.env.HOST}:${PORT}`);
  });

  configureSockets(server);
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
