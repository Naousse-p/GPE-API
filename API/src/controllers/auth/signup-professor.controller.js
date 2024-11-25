const { signup_professor_service } = require("./services");

exports.signup_professor = async (req, res) => {
  try {
    const { user, school, professor, classroom } = req.body;
    await signup_professor_service(user, school, professor, classroom);
    res.status(201).json({ user, school, professor });
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
