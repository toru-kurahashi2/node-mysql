const express = require('express');
const router = express.Router();
const knex = require("../db/knex");
const bcrypt = require("bcrypt");

router.get('/', function (req, res, next) {
  const userId = req.session.userid;
const isAuth = Boolean(userId);
  res.render('signup', {
    title: 'Sign up',
    isAuth: isAuth,
  });
});

router.post('/', function (req, res, next) {
  const userId = req.session.userid;
  const isAuth = Boolean(userId);
  const username = req.body.username;
  const password = req.body.password;
  const repassword = req.body.repassword;

  if (!username || !password || !repassword) {
    return res.render('signup', {
      title: 'Sign up',
      errorMessage: ['すべての項目を入力してください'],
      isAuth: isAuth,
    });
  }

  if (password !== repassword) {
    return res.render('signup', {
      title: 'Sign up',
      errorMessage: ['パスワードが一致しません'],
      isAuth: isAuth,
    });
  }

  (async () => {
    try {
      const existing = await knex('users').where({ name: username }).select('*');
      if (existing.length !== 0) {
        return res.render('signup', {
          title: 'Sign up',
          errorMessage: ['このユーザ名は既に使われています'],
          isAuth: isAuth,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const inserted = await knex('users').insert({ name: username, password: hashedPassword });
      const insertedId = Array.isArray(inserted) ? inserted[0] : inserted;

      req.session.userid = insertedId;
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.render('signup', {
        title: 'Sign up',
        errorMessage: [err.sqlMessage || err.message],
        isAuth: isAuth,
      });
    }
  })();
});
module.exports = router;
