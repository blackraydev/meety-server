let rooms = {};

const handleGetRoom = (req, res) => {
  const { id: roomId } = req.params;

  if (rooms[roomId]) {
    return res.send(rooms[roomId]);
  }

  return res.status(404).send();
};

module.exports = {
  handleGetRoom,
};
