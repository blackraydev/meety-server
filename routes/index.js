const express = require('express');
const userRouter = require('./userRoutes');
const roomRouter = require('./roomRoutes');

const router = express.Router();

router.get('/', (_, res) => {
  res.send('Connection established');
});

// router.use('/users', userRouter);
router.use('/rooms', roomRouter);

module.exports = router;
