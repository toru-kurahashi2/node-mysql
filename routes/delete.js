const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

// /delete/:id に POST すると削除する
router.post('/:id', async (req, res) => {
  const isAuth = req.isAuthenticated();
  if (!isAuth) {
    return res.redirect('/signin');
  }

  const userId = req.user.id;
  const taskId = req.params.id;

  try {
    // 自分のタスクだけ削除できるようにする
    await knex("tasks")
      .where({ id: taskId, user_id: userId })
      .del();

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
