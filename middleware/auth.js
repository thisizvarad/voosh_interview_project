const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token)
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Missing authorization token" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== "admin") {
      const users = await User.findAll({
        where: { profileVisibility: "public" }
      });
      res.json(users);
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
