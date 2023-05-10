const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);
const cors = require('cors');

const SocketEventTypes = require('./constants/socketEventTypes');
const PORT = process.env.PORT || 8000;

app.use(cors());

app.get('/', (req, res) => {
  console.log('PING RECEIVED');
  res.send('success');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on(SocketEventTypes.Join, (config) => {
    const { room: roomId } = config;
    const { rooms: joinedRooms } = socket;

    if (Array.from(joinedRooms).includes(roomId)) {
      return console.warn(`Already joined to ${roomId}`);
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    clients.forEach((clientId) => {
      io.to(clientId).emit(SocketEventTypes.AddPeer, {
        peerId: socket.id,
        createOffer: false,
      });

      socket.emit(SocketEventTypes.AddPeer, {
        peerId: clientId,
        createOffer: true,
      });
    });

    socket.join(roomId);
  });

  function leaveRoom() {
    const { rooms } = socket;

    Array.from(rooms).forEach((roomId) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

      clients.forEach((clientId) => {
        io.to(clientId).emit(SocketEventTypes.RemovePeer, {
          peerId: socket.id,
        });

        socket.emit(SocketEventTypes.RemovePeer, {
          peerId: clientId,
        });
      });

      socket.leave(roomId);
    });
  }

  socket.on(SocketEventTypes.Leave, leaveRoom);
  socket.on(SocketEventTypes.Disconnecting, leaveRoom);

  socket.on(SocketEventTypes.RelaySDP, ({ peerId, sessionDescription }) => {
    io.to(peerId).emit(SocketEventTypes.SessionDescription, {
      peerId: socket.id,
      sessionDescription,
    });
  });

  socket.on(SocketEventTypes.RelayIce, ({ peerId, iceCandidate }) => {
    io.to(peerId).emit(SocketEventTypes.IceCandidate, {
      peerId: socket.id,
      iceCandidate,
    });
  });
});
