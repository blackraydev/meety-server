const Users = require('../models/users');

const handleUserCheck = async (req, res, next) => {
  try {
    const { login, email } = req.body;

    const userByLogin = await Users.findOne({
      where: {
        login,
      },
    });

    if (userByLogin) {
      return res.status(409).send({ login: userByLogin.login });
    }

    const userByEmail = await Users.findOne({
      where: {
        email,
      },
    });

    if (userByEmail) {
      return res.status(409).send({ email: userByEmail.email });
    }

    next();
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  handleUserCheck,
};
