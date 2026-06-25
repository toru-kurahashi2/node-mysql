const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '[あなたのパスワード]',
  database: 'todo_app'
});

// ファイルの冒頭にあった「let todos = [];」は不要なので削除したままでOKです

router.get('/', function (req, res, next) {
  // ここで初めて todos を定義して使う
  connection.query('SELECT * FROM tasks', (error, results) => {
    res.render('index', {
      title: 'ToDo App',
      todos: results || [], // ここでresultsをtodosとして渡す
    });
  });
});

router.post('/', function (req, res, next) {
  const todo = req.body.add;
  connection.query(
    `insert into tasks (user_id, content) values (1, '${todo}');`,
    (error, results) => {
      res.redirect('/');
    }
  );
});

module.exports = router;