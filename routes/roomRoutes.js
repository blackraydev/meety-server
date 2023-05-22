const express = require('express');
const { handleGetRoom } = require('../controllers/roomController');

const roomRouter = express.Router();

roomRouter.get('/:id', handleGetRoom);

module.exports = roomRouter;
