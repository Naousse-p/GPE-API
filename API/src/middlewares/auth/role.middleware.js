const verifyUserIsProfessor = (req, res, next) => {
  const role = req.role;
  if (!role.includes("professor")) return res.status(403).json({ message: "You don't have permission" });
  next();
};

const verifyUserIsParents = (req, res, next) => {
  const role = req.role[0];
  if (role !== "parents") return res.status(403).json({ message: "You don't have permission" });
  next();
};

module.exports = {
  verifyUserIsProfessor,
  verifyUserIsParents,
};
