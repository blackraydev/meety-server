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
  Disconnecting: 'disconnecting',
  AudioStatus: 'audio-status',
  VideoStatus: 'video-status',
  ScreenShareStatus: 'screen-share-status',
  CheckExistingRoom: 'check-existing-room',
  SendMessage: 'send-message',
};

module.exports = SocketEventTypes;
