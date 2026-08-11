const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();

  console.log(`isAuth: ${isAuth}`);

  // カレンダーで選択された年月
  const selectedMonth = req.query.month;

  if (isAuth) {
    knex("tasks")
      .where({ user_id: req.user.id })
      .select("*")
      .then(function (results) {

        res.render('index', {
          title: 'ToDo App',
          todos: results,
          isAuth: isAuth,
          month: selectedMonth
        });

      })
      .catch(function (err) {
        console.error(err);

        res.render('index', {
          title: 'ToDo App',
          todos: [],
          isAuth: isAuth,
          month: selectedMonth
        });
      });

  } else {

    res.render('index', {
      title: 'ToDo App',
      todos: [],
      isAuth: false,
      month: selectedMonth
    });

  }
});


/* タスク追加 */
router.post('/', function (req, res, next) {

  const isAuth = req.isAuthenticated();

  const todo = req.body.add;
  const deadline = req.body.deadline;

  if (!isAuth) {
    return res.redirect('/signin');
  }

  knex("tasks")
    .insert({
      user_id: req.user.id,
      content: todo,
      deadline: deadline
    })
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      console.error(err);

      res.render('index', {
        title: 'ToDo App',
        todos: [],
        isAuth: isAuth,
        month: selectedMonth
      });
    });

});


/* タスク完了 */
router.post('/complete', function (req, res, next) {

  if (!req.isAuthenticated()) {
    return res.redirect('/signin');
  }

  const taskId = req.body.id;

  knex("tasks")
    .where({
      id: taskId,
      user_id: req.user.id
    })
    .update({
      completed: true
    })
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      console.error(err);
      res.redirect('/');
    });

});


/* タスク削除 */
router.post('/delete', function (req, res, next) {

  if (!req.isAuthenticated()) {
    return res.redirect('/signin');
  }

  const taskId = req.body.id;

  knex("tasks")
    .where({
      id: taskId,
      user_id: req.user.id
    })
    .del()
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      console.error(err);
      res.redirect('/');
    });

});


router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;