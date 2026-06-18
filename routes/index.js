const express = require('express');
const router = express.Router();
const mysql = require('mysql');

let todos = [];

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'todo_app'
});

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'ToDo App',
    todos: todos,
  });
});

router.post('/', function (req, res, next) {
  connection.connect((err) => {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return
    }
    console.log('success');
  });
  const todo = req.body.add;
  res.redirect('/');
});

module.exports = router;