const { DataTypes } = require('sequelize');
const db = require('../db.js');

const Users = db.define(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      isEmail: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { timestamps: false },
);

// (async () => await Users.sync())();

module.exports = Users;
