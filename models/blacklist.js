const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Blacklist = sequelize.define(
  "Blacklist",
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    timestamps: false
  }
);

module.exports = Blacklist;
