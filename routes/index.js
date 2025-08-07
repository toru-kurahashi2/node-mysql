const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

/* GET home page. */
router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (!isAuth) {
        res.render('index', {
      title: 'ToDo App',
      isAuth: isAuth,
    });
  }else{

  knex('tasks')
    .where('user_id', req.user.id)
    .orderBy('id', 'desc')
    .then((tasks) => {
      res.render('index', { 
        title: 'ToDoリスト', 
        tasks: tasks, 
        user: req.user, 
        errorMessage: req.flash('error'),
        isAuth: isAuth,
        userName: req.user.name // userNameを追加
      });
    })
    .catch((err) => {
      console.error(err);
      res.render('index', { 
        title: 'ToDoリスト',
        tasks: [], 
        user: req.user, 
        errorMessage: 'データベースの操作中にエラーが発生しました。',
        isAuth: isAuth,
        userName: req.user.name // エラー時にもuserNameを追加
      });
    });
  }
});

/* POST new task. */
router.post('/', function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/signin');
  }

  const { content } = req.body;
  if (!content) {
    req.flash('error', 'タスク名を入力してください');
    return res.redirect('/');
  }

  knex('tasks')
    .insert({
      content: content,
      user_id: req.user.id
    })
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      console.error(err);
      req.flash('error', 'タスクの追加中にエラーが発生しました。');
      res.redirect('/');
    });
});

/* POST complete task. */
router.post('/complete', function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/signin');
  }
  const { task_id } = req.body;
  
  // ToDoの完了状態を切り替える
  knex('tasks')
    .where('id', task_id)
    .select('is_done')
    .then((tasks) => {
      if (tasks.length === 0) {
        req.flash('error', 'タスクが見つかりませんでした。');
        return res.redirect('/');
      }
      const newIsDone = tasks[0].is_done === 0 ? 1 : 0;
      return knex('tasks')
        .where('id', task_id)
        .update({ is_done: newIsDone });
    })
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      console.error(err);
      req.flash('error', 'タスクの更新中にエラーが発生しました。');
      res.redirect('/');
    });
});

module.exports = router;