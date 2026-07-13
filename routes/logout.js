const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  if (req.session) {
    req.session.userid = null;
    req.session = null;
  }

  res.clearCookie('session');
  res.clearCookie('session.sig');
  return res.redirect('/');
});

module.exports = router;