const { signup_parent_service } = require("./services");

exports.signup_parent = async (req, res) => {
  try {
    const { user, parent } = req.body;
    await signup_parent_service(user, parent);
    res.status(201).json({ user, parent });
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
