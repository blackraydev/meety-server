const express = require('express');
const { handleUserCheck } = require('../middlewares/userMiddleware');
const { handleAuth, handleRegister } = require('../controllers/userController');

const userRouter = express.Router();

userRouter.post('/register', handleUserCheck, handleRegister);
userRouter.post('/auth', handleAuth);

module.exports = userRouter;
