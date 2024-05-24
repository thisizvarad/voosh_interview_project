const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("../config/passport");
const Blacklist = require("../models/blacklist");
const checkBlacklist = require("../middleware/checkBlacklist");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, profileVisibility, bio, phone } =
      req.body;
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      profileVisibility,
      bio,
      phone
    });
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(400).json({ message: "Authentication failed." });
    }
    if (!user) {
      console.warn("User not found or invalid credentials:", info);
      return res
        .status(400)
        .json({ message: info ? info.message : "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );
    res.json({ token });
  })(req, res, next);
});

router.post("/logout", checkBlacklist, async (req, res) => {
  try {
    const token = req.headers.authorization; // Get the token from the request headers
    await Blacklist.create({ token }); // Add the token to the blacklist
    res.clearCookie("token"); // Clear the token from the client-side
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error logging out:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth/github/error"
  }),
  (req, res) => {
    // Successful authentication, redirect to your desired location.
    res.redirect("/auth/github/success");
  }
);

router.get("/github/success", async (req, res) => {
  const userinfo = {
    id: req.session.passport.user.id,
    displayname: req.session.passport.user.username,
    provider: req.session.passport.user.provider
  };
  res.render("fb-github-success", { user: userinfo });
});

router.get("/github/error", (req, res) => res.send("Error logging via github"));

module.exports = router;
