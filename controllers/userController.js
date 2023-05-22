const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('@sequelize/core');
const Users = require('../models/users');

const handleAuth = async (req, res) => {
  const { login, password } = req.body;

  const targetUser = await Users.findOne({
    where: {
      [Op.or]: [{ login }, { email: login }],
    },
  });

  if (targetUser) {
    const isSamePassword = await bcrypt.compare(password, targetUser.password);

    if (isSamePassword) {
      const token = jwt.sign({ id: targetUser.id }, process.env.TOKEN_SECRET_KEY, {
        expiresIn: 24 * 60 * 60 * 1000,
      });

      res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

      return res.status(201).send(targetUser);
    }
  }

  return res.status(401).send('Authentication failed');
};

const handleRegister = async (req, res) => {
  const { login, email, password } = req.body;

  const newUser = await Users.create({
    login,
    email,
    password: await bcrypt.hash(password, 10),
  });

  if (newUser) {
    const token = jwt.sign({ id: newUser.id }, process.env.TOKEN_SECRET_KEY, {
      expiresIn: 24 * 60 * 60 * 1000,
    });

    res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

    return res.status(201).send(newUser);
  }

  return res.status(409).send('Details are incorrect');
};

module.exports = {
  handleAuth,
  handleRegister,
};
