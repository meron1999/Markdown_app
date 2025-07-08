const express = require('express');
const router = express.Router();
const { User, Board } = require('../models');
const bcrypt = require('bcrypt');

// ユーザーが認証済みか確認するミドルウェア
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next(); // 認証済みなら次の処理へ
  } else {
    // 認証されていなければログインページにリダイレクト
    res.redirect('/login');
  }
};

/* GET home page. ログインしていればダッシュボード、していなければログインページへ */
router.get('/', (req, res, next) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

/* GET login page. */
router.get('/login', (req, res, next) => {
  // エラーメッセージをセッションから取得（あれば）
  const errorMessage = req.session.errorMessage;
  // 一度使ったらセッションから削除
  delete req.session.errorMessage;
  res.render('login', { title: 'Login', errorMessage: errorMessage });
});

/* POST user login. */
router.post('/login', async (req, res, next) => {
  try {
    const { name, pass } = req.body;
    if (!name || !pass) {
      req.session.errorMessage = '名前とパスワードを入力してください。';
      return res.redirect('/login');
    }

    const user = await User.findOne({ where: { name } });
    if (!user || !(await bcrypt.compare(pass, user.pass))) {
      req.session.errorMessage = '名前またはパスワードが正しくありません。';
      return res.redirect('/login');
    }

    req.session.user = {
      id: user.id,
      name: user.name
    };

    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

/* GET user logout. */
router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

/* GET dashboard page. */
router.get('/dashboard', isAuthenticated, async (req, res, next) => {
  try {
    const user = req.session.user;
    const boards = await Board.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.render('dashboard', { title: 'Dashboard', user: user, boards: boards });
  } catch (err) {
    next(err);
  }
});

/* POST new board. */
router.post('/dashboard', isAuthenticated, async (req, res, next) => {
  const { title, message } = req.body;
  const userId = req.session.user.id;
  await Board.create({ title, message, userId });
  res.redirect('/dashboard');
});

/* GET edit page. */
router.get('/edit/:id', isAuthenticated, async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) {
      // 投稿が見つからない場合は404
      return next();
    }
    // 投稿の所有者でなければ、アクセスを拒否
    if (board.userId !== req.session.user.id) {
      const err = new Error('Forbidden');
      err.status = 403;
      return next(err);
    }
    res.render('edit', { title: 'Edit Post', board: board });
  } catch (err) {
    next(err);
  }
});

/* POST update post. */
router.post('/edit/:id', isAuthenticated, async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) {
      return next();
    }
    // 投稿の所有者でなければ、更新を拒否
    if (board.userId !== req.session.user.id) {
      const err = new Error('Forbidden');
      err.status = 403;
      return next(err);
    }
    const { title, message } = req.body;
    await board.update({ title, message });
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

/* POST delete post. */
router.post('/delete/:id', isAuthenticated, async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (board && board.userId === req.session.user.id) {
      // 投稿が存在し、かつ所有者であれば削除
      await board.destroy();
    } else if (board) {
      // 投稿は存在するが、所有者でない場合はエラー
      const err = new Error('Forbidden');
      err.status = 403;
      return next(err);
    }
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

// サインアップページ
router.get('/signup', (req, res) => {
  const errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render('signup', { errorMessage });
});

// サインアップ処理
router.post('/signup', async (req, res) => {
  try {
    const { name, pass } = req.body;
    if (!name || !pass) {
      req.session.errorMessage = '名前とパスワードは必須です。';
      return res.redirect('/signup');
    }
    const existingUser = await User.findOne({ where: { name } });
    if (existingUser) {
      req.session.errorMessage = 'そのユーザー名は既に使われています。';
      return res.redirect('/signup');
    }
    const hashedPassword = await bcrypt.hash(pass, 10);
    await User.create({ name, pass: hashedPassword });
    req.session.user = { name };
    res.redirect('/dashboard');
  } catch (err) {
    req.session.errorMessage = '登録に失敗しました。';
    res.redirect('/signup');
  }
});

module.exports = router;
