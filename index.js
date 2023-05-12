const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);
const cors = require('cors');

const SocketEventTypes = require('./constants/socketEventTypes');
const PORT = process.env.PORT || 8000;

let rooms = {};

app.use(cors());

app.get('/', (req, res) => {
  res.send('Connection established');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on(SocketEventTypes.Join, ({ roomId, clientName }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push({
      clientId: socket.id,
      clientName,
    });

    const clients = rooms[roomId].filter((client) => client.clientId !== socket.id);

    clients.forEach((client) => {
      // Sending other clients in room data about joined user
      io.to(client.clientId).emit(SocketEventTypes.AddPeer, {
        peerId: socket.id,
        peerName: clientName,
        createOffer: false,
      });

      // Sending joined user data about other clients in room
      socket.emit(SocketEventTypes.AddPeer, {
        peerId: client.clientId,
        peerName: client.clientName,
        createOffer: true,
      });
    });

    socket.join(roomId);
  });

  function leaveRoom() {
    const newRooms = {};

    Object.entries(rooms).forEach(([roomId, clients]) => {
      const newClients = clients.filter((client) => client.clientId !== socket.id);
      const clientIds = clients.map((client) => client.clientId);

      clientIds.forEach((clientId) => {
        io.to(clientId).emit(SocketEventTypes.RemovePeer, {
          peerId: socket.id,
        });

        socket.emit(SocketEventTypes.RemovePeer, {
          peerId: clientId,
        });
      });

      if (newClients.length) {
        newRooms[roomId] = newClients;
      } else {
        delete newRooms[roomId];
      }

      socket.leave(roomId);
    });

    rooms = newRooms;
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

  socket.on(SocketEventTypes.VideoStatus, ({ roomId, enabled }) => {
    const clients = rooms[roomId];

    if (clients) {
      const clientIds = clients.map((client) => client.clientId);

      clientIds.forEach((clientId) => {
        io.to(clientId).emit(SocketEventTypes.VideoStatus, { peerId: socket.id, enabled });
      });
    }
  });

  socket.on(SocketEventTypes.AudioStatus, ({ roomId, enabled }) => {
    const clients = rooms[roomId];

    if (clients) {
      const clientIds = clients.map((client) => client.clientId);

      clientIds.forEach((clientId) => {
        io.to(clientId).emit(SocketEventTypes.AudioStatus, { peerId: socket.id, enabled });
      });
    }
  });

  socket.on(SocketEventTypes.CheckExistingRoom, ({ roomId }) => {
    const exist = Object.keys(rooms).find((room) => room === roomId);
    io.to(socket.id).emit(SocketEventTypes.CheckExistingRoom, { exist });
  });
});
