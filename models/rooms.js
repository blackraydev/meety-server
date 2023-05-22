const { DataTypes } = require('sequelize');
const db = require('../db.js');

const Rooms = db.define(
  'rooms',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
);

(async () => await Rooms.sync())();

module.exports = Rooms;
