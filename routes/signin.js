const express = require('express');
const router = express.Router();
const passport = require("passport");

router.get('/', function (req, res, next) {
  const userId = req.session.userid;
  const isAuth = Boolean(userId);
  res.render("signin", {
    title: "Sign in",
    isAuth: isAuth,
  });
});

router.post('/', function (req, res, next) {
  passport.authenticate('local', function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/signin');
    }

    req.login(user, function (err) {
      if (err) {
        return next(err);
      }

      req.session.userid = user.id;
      return res.redirect('/');
    });
  })(req, res, next);
});

module.exports = router;