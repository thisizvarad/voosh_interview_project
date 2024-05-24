const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const checkBlacklist = require("../middleware/checkBlacklist");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Middleware to check if user is authenticated and admin
const auth = passport.authenticate("jwt", { session: false });

router.get("/me", auth, checkBlacklist, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json(user);
  } catch (err) {
    // console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put(
  "/me",
  auth,
  checkBlacklist,
  upload.single("photo"),
  async (req, res) => {
    try {
      const updates = req.body;

      if (Object.keys(updates).length === 0 && !req.file) {
        return res
          .status(400)
          .json({ error: "Please provide values to update" });
      }

      delete updates.role;
      delete updates.id;

      if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);
      }

      if (req.file) {
        updates.photo = req.file.path;
      }
      const user = await User.update(updates, {
        where: { id: req.user.id },
        returning: true
      });
      res.status(201).json({ message: "Details Updated Successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/all", auth, checkBlacklist, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
