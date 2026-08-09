const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const bcrypt = require('bcrypt');

router.get('/', function (req, res, next) {
  const userId = req.session.userid;
  const isAuth = Boolean(userId);

  res.render("signin", {
    title: "Sign in",
    isAuth: isAuth,
  });
});

router.post('/', function (req, res, next) {
  const userId = req.session.userid;
  const isAuth = Boolean(userId);

  const username = req.body.username;
  const password = req.body.password;

  knex("users")
    .where({
      name: username,
    })
    .select("*")
    .then(function (results) {

      if (results.length === 0) {

        res.render("signin", {
          title: "Sign in",
          errorMessage: ["ユーザが見つかりません"],
          isAuth: isAuth,
        });

      } else {

        bcrypt.compare(password, results[0].password)
          .then(function (comparedPassword) {

            if (comparedPassword) {

              req.session.userid = results[0].id;
              res.redirect('/');

            } else {

              res.render("signin", {
                title: "Sign in",
                errorMessage: ["パスワードが違います"],
                isAuth: isAuth,
              });

            }

          })
          .catch(function (err) {
            console.error(err);

            res.render("signin", {
              title: "Sign in",
              errorMessage: [err.message],
              isAuth: isAuth,
            });
          });
      }

    })
    .catch(function (err) {
      console.error(err);

      res.render("signin", {
        title: "Sign in",
        errorMessage: [err.sqlMessage],
        isAuth: isAuth,
      });
    });
});

module.exports = router;