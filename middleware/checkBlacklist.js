const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklist");

const checkBlacklist = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const isBlacklisted = await Blacklist.findOne({ where: { token } });
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is blacklisted" });
    }

    next();
  } catch (err) {
    console.error("Error checking blacklist:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = checkBlacklist;
