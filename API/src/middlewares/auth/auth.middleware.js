const jwt = require("jsonwebtoken");
const { Role } = require("../../models");

const getRoleNames = async (roles) => {
  const roleNames = [];
  for (let i = 0; i < roles.length; i++) {
    const role = await Role.findById(roles[i]._id);
    roleNames.push(role.name);
  }
  return roleNames;
};

const verifyAccessToken = (req, res, next) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) return res.status(401).json({ message: "Access token not provided" });

  const token = accessToken.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid access token" });

  jwt.verify(token, process.env.SECRET_TOKEN_ACCESS, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid access token" });
    req.userId = decoded.userId;
    const roles = await getRoleNames(decoded.role);
    req.role = roles;
    next();
  });
};

const verifyAccessTokenSocket = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_TOKEN_ACCESS, async (err, decoded) => {
      if (err) return reject(new Error("Invalid access token"));
      const roles = await getRoleNames(decoded.role);
      resolve({ userId: decoded.userId, roles });
    });
  });
};

const verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.headers.cookie;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token not provided" });

  const token = refreshToken.split("=")[1];
  if (!token) return res.status(401).json({ message: "Invalid refresh token" });
  jwt.verify(token, process.env.SECRET_TOKEN_REFRESH, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });
    req.userId = decoded.userId;
    next();
  });
};

module.exports = {
  verifyAccessToken,
  verifyAccessTokenSocket,
  verifyRefreshToken,
};
