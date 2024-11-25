const socketIo = require("socket.io");
const { verifyAccessTokenSocket } = require("../middlewares/auth/auth.middleware.js");

let io;
const connectedUsers = {};
const onlineUsers = new Set();

module.exports = function (server) {
  console.log("Socket server started");
  io = socketIo(server, {
    cors: {
      origin: ["http://localhost:3000", "http://192.168.1.167:3000"], // Autoriser les demandes provenant de notre application front-end
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const { userId, roles } = await verifyAccessTokenSocket(token);
      socket.userId = userId;
      socket.roles = roles;
      onlineUsers.add(userId);
      io.emit("userOnline", { userId });
      next();
    } catch (error) {
      console.error("Authentication error:", error.message);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinConversation", (data) => {
      const { conversationId } = data;
      const userId = socket.userId;
      socket.join(conversationId);

      if (!connectedUsers[conversationId]) {
        connectedUsers[conversationId] = new Set();
      }
      connectedUsers[conversationId].add(userId);

      socket.to(conversationId).emit("userConnected", { userId, conversationId });

      // Envoyer la liste des utilisateurs connectés à l'utilisateur nouvellement connecté
      socket.emit("connectedUsers", Array.from(connectedUsers[conversationId]));

      // Envoyer la liste des utilisateurs en ligne à tous les utilisateurs de la conversation
      io.to(conversationId).emit("onlineUsers", Array.from(onlineUsers));

      // Signalez aux utilisateur de la conversation que les messages ont été lus
    });

    socket.on("markAsRead", async (data, callback) => {
      try {
        const { conversationId } = data;
        const userId = socket.userId;
        // Envoyer un événement 'messagesRead' à tous les utilisateurs de la conversation
        io.to(conversationId).emit("messagesRead", { userId, conversationId });

        if (typeof callback === "function") {
          callback({ status: "success" });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
        callback({ status: "error", message: error.message });
      }
    });

    socket.on("conversationUpdated", (data) => {
      const { conversationId } = data;
      io.to(conversationId).emit("conversationUpdated", { conversationId });
    });

    socket.on("sendMessage", async (data, callback) => {
      try {
        const message = data;

        // Émettre le nouveau message à la conversation
        io.to(data.conversationId).emit("newMessage", message);

        // Émettre un événement global à tous les utilisateurs connectés
        io.emit("messageSent", { conversationId: data.conversationId });

        if (typeof callback === "function") {
          callback({ status: "success", message });
        } else {
          console.error("Callback is not a function");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        callback({ status: "error", message: error.message });
      }
    });

    socket.on("editMessage", async (data, callback) => {
      try {
        const { conversationId, messageId, newText } = data;
        // Émettre un événement 'messageEdited' à la conversation
        io.to(conversationId).emit("messageEdited", { messageId, newText });

        if (typeof callback === "function") {
          callback({ status: "success" });
        }
      } catch (error) {
        console.error("Error editing message:", error);
        callback({ status: "error", message: error.message });
      }
    });

    socket.on("deleteMessage", async (data, callback) => {
      try {
        const { conversationId, messageId } = data;
        // Émettre un événement 'messageDeleted' à la conversation
        io.to(conversationId).emit("messageDeleted", messageId);

        if (typeof callback === "function") {
          callback({ status: "success" });
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        callback({ status: "error", message: error.message });
      }
    });

    socket.on("typing", (data) => {
      const userId = socket.userId; // Retrieve userId from socket object
      // Émettre un événement 'userTyping' à tous les utilisateurs de la conversation sauf celui qui est en train d'écrire
      socket.to(data.conversationId).emit("userTyping", { userId, conversationId: data.conversationId });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");

      // Remove user from the online users set
      onlineUsers.delete(socket.userId);
      io.emit("userOffline", { userId: socket.userId }); // Notify all clients that the user is offline

      for (const conversationId in connectedUsers) {
        connectedUsers[conversationId].forEach((userId) => {
          if (socket.userId === userId) {
            connectedUsers[conversationId].delete(userId);
            socket.to(conversationId).emit("userDisconnected", { userId, conversationId });
          }
        });
      }

      // Envoyer la liste des utilisateurs en ligne à tous les utilisateurs de la conversation
      for (const conversationId in connectedUsers) {
        io.to(conversationId).emit("onlineUsers", Array.from(onlineUsers));
      }
      // Remove user from the connected users list
    });
  });

  return io;
};

module.exports.io = io;
