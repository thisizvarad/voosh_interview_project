const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    photo: {
      type: DataTypes.STRING
    },
    bio: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    profileVisibility: {
      type: DataTypes.ENUM("public", "private"),
      defaultValue: "public"
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user"
    }
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
);

module.exports = User;
