const express = require('express');
const router = express.Router();
const { User } = require('../models'); // Import the User model
const bcrypt = require('bcrypt'); // bcryptをインポート

/* GET all users. */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/* POST create a new user. */
router.post('/', async (req, res, next) => {
  try {
    const { name, pass } = req.body;
    if (!name || !pass) {
      return res.status(400).json({ error: 'The "name" and "pass" fields are required.' });
    }
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = await User.create({ name, pass: hashedPassword });

    // レスポンスにはパスワードを含めない
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
    res.status(201).json(userResponse);
  } catch (err) {
    // Sequelizeのバリデーションエラーをハンドル
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ errors: messages });
    }
    next(err);
  }
});

module.exports = router;
