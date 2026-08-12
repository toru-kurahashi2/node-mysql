const express = require('express');
const router = express.Router();

const knex = require('../db/knex');



router.get('/', function (req, res, next) {
 const userId = req.session.userid;
 const isAuth = Boolean(userId);
 

  knex("tasks")
    .select("*")
    .then(function (results) {
      console.log(results);
      res.render('index', {
        title: 'ToDo App',
        todos: results,
        isAuth:isAuth,
      });
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'ToDo App',
        todos: [],
        isAuth: isAuth,
      });
    });
});

router.post('/', function (req, res, next) {

  const userId = req.session.userid;
  const isAuth = Boolean(userId);
  const todo = req.body.add;
  const priority = req.body.priority || 'low';
  const category = req.body.category || 'other';
  if (!todo || String(todo).trim() === '') {
    return res.redirect('/');
  }

  // normalize priority and category
  const p = ['high', 'medium', 'low'].includes(priority) ? priority : 'low';
  const c = ['school', 'work', 'personal', 'other'].includes(category) ? category : 'other';

  knex("tasks")
    .insert({user_id: userId, content: todo, priority: p, category: c})
    .then(function () {
      res.redirect('/')
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'ToDo App',
        todos: [],
        isAuth: isAuth,
      });
    });
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;
