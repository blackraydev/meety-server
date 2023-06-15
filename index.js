require('dotenv').config();

const http = require('http');
const cors = require('cors');
const express = require('express');
const socket = require('socket.io');
const cookieParser = require('cookie-parser');

// const db = require('./db');
const router = require('./routes/index');
const socketHandler = require('./socketHandler');

const app = express();
const server = http.createServer(app);
const io = socket(server);
const PORT = process.env.PORT || 8000;

// Middlwares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router);

// Database connection
// db.authenticate().catch(console.error);

// Socket connection
io.on('connection', (socket) => socketHandler(socket, io));

// Server connection
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
