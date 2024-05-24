const express = require("express");
const session = require("express-session");
const passport = require("passport");
const sequelize = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

sequelize
  .sync()
  .then(() => console.log("MySQL connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
