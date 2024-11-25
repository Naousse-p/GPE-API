const corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000", "http://192.168.1.167:3000"], // Autoriser les demandes provenant de notre application front-end
  optionsSuccessStatus: 200, // Répondre
};

module.exports = corsOptions;
