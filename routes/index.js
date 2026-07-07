const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '[事前準備で設定したrootユーザのパスワード]',
  database: 'todo_app'
});

router.get('/', function (req, res, next) {
  connection.query(
    `select * from tasks;`,
    (error, results) => {
      if (error) {
        console.log(error);
        return res.render('index', {
          title: 'ToDo App',
          todos: [],
        });
      }

      res.render('index', {
        title: 'ToDo App',
        todos: Array.isArray(results) ? results : [],
      });
    }
  );
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
  connection.query(
    `insert into tasks (user_id, content) values (1, '${todo}');`,
    (error, results) => {
      console.log(error);
      res.redirect('/');
    }
  );
});

module.exports = router;
