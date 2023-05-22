const SocketEventTypes = require('./constants/socketEventTypes');
const MediaTypes = require('./constants/mediaTypes');

let rooms = {};

const socketHandler = (socket, io) => {
  const handleJoinRoom = ({ roomId, clientName, cameraActive, micActive }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push({
      clientId: socket.id,
      screenShareActive: false,
      clientName,
      cameraActive,
      micActive,
    });

    const clients = rooms[roomId].filter((client) => client.clientId !== socket.id);

    clients.forEach((client) => {
      // Sending other clients in room data about joined user
      io.to(client.clientId).emit(SocketEventTypes.AddPeer, {
        peerId: socket.id,
        peerName: clientName,
        peerCameraActive: cameraActive,
        peerMicActive: micActive,
        peerScreenShareActive: false,
        createOffer: false,
      });

      // Sending joined user data about other clients in room
      socket.emit(SocketEventTypes.AddPeer, {
        peerId: client.clientId,
        peerName: client.clientName,
        peerCameraActive: client.cameraActive,
        peerMicActive: client.micActive,
        peerScreenShareActive: client.screenShareActive,
        createOffer: true,
      });
    });

    socket.join(roomId);
  };

  const handleLeaveRoom = () => {
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
  };

  const handleRelaySDP = ({ peerId, sessionDescription }) => {
    io.to(peerId).emit(SocketEventTypes.SessionDescription, {
      peerId: socket.id,
      sessionDescription,
    });
  };

  const handleRelayIce = ({ peerId, iceCandidate }) => {
    io.to(peerId).emit(SocketEventTypes.IceCandidate, {
      peerId: socket.id,
      iceCandidate,
    });
  };

  const createMediaStatusHandler =
    (type) =>
    ({ roomId, enabled }) => {
      const clients = rooms[roomId];

      if (clients) {
        const currentClient = clients.find((client) => client.clientId === socket.id);
        const clientIds = clients
          .filter((client) => client.clientId !== socket.id)
          .map((client) => client.clientId);

        let socketEventType;
        let field;

        switch (type) {
          case MediaTypes.Audio: {
            socketEventType = SocketEventTypes.AudioStatus;
            field = 'micActive';
            break;
          }
          case MediaTypes.Video: {
            socketEventType = SocketEventTypes.VideoStatus;
            field = 'cameraActive';
            break;
          }
          case MediaTypes.ScreenShare: {
            socketEventType = SocketEventTypes.ScreenShareStatus;
            field = 'screenShareActive';
            break;
          }
        }

        if (currentClient) {
          currentClient[field] = enabled;
        }

        clientIds.forEach((clientId) => {
          io.to(clientId).emit(socketEventType, { peerId: socket.id, enabled });
        });
      }
    };

  const handleSendMessage = ({ roomId, clientName, message }) => {
    const clients = rooms[roomId];

    clients.forEach((client) => {
      io.to(client.clientId).emit(SocketEventTypes.SendMessage, {
        peerName: clientName,
        message: {
          messageText: message.messageText,
          messageDate: message.messageDate,
        },
      });
    });
  };

  socket.on(SocketEventTypes.Join, handleJoinRoom);
  socket.on(SocketEventTypes.Leave, handleLeaveRoom);
  socket.on(SocketEventTypes.Disconnecting, handleLeaveRoom);
  socket.on(SocketEventTypes.RelaySDP, handleRelaySDP);
  socket.on(SocketEventTypes.RelayIce, handleRelayIce);
  socket.on(SocketEventTypes.SendMessage, handleSendMessage);

  socket.on(SocketEventTypes.VideoStatus, createMediaStatusHandler(MediaTypes.Video));
  socket.on(SocketEventTypes.AudioStatus, createMediaStatusHandler(MediaTypes.Audio));
  socket.on(SocketEventTypes.ScreenShareStatus, createMediaStatusHandler(MediaTypes.ScreenShare));
};

module.exports = socketHandler;
