const SocketEventTypes = {
  Join: 'join',
  Leave: 'leave',
  ShareRooms: 'share-rooms',
  AddPeer: 'add-peer',
  RemovePeer: 'remove-peer',
  RelaySDP: 'relay-sdp',
  RelayIce: 'relay-ice',
  IceCandidate: 'ice-candidate',
  SessionDescription: 'session-description',
};

module.exports = SocketEventTypes;
