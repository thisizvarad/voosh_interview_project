const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const FacebookStrategy = require("passport-facebook").Strategy;
// const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const router = require("../routes/auth");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          console.log("User not found:", email);
          return done(null, false, { message: "Incorrect email" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log("Incorrect password for user:", email);
          return done(null, false, { message: "Incorrect password" });
        }
        console.log("Authentication successful for user:", email);
        return done(null, user);
      } catch (err) {
        console.error("Error during authentication:", err);
        return done(err);
      }
    }
  )
);

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findByPk(payload.id);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          accountId: profile.id,
          provider: "github"
        });

        if (!user) {
          console.log("Adding new github user to DB! ");
          user = await User.create({
            accountId: profile.id,
            username: profile.username,
            provider: profile.provider
            // displayName: profile.displayName || profile.username,
            // email: profile.emails ? profile.emails[0].value : null
          });
          await user.save();
          return done(null, profile);
        } else {
          console.log("Github User Already exists !");
          return done(null, profile);
        }
      } catch (err) {
        console.error("Error during GitHub authentication:", err);
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
