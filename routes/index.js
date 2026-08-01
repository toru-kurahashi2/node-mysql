const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

async function getTaskColumns() {
  const hasUserId = await knex.schema.hasColumn('tasks', 'user_id');
  const hasContent = await knex.schema.hasColumn('tasks', 'content');
  const hasTitle = await knex.schema.hasColumn('tasks', 'title');
  const hasStatus = await knex.schema.hasColumn('tasks', 'status');

  return { hasUserId, hasContent, hasTitle, hasStatus };
}

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (isAuth) {
    const userId = req.user.id;
    getTaskColumns()
      .then(async function (columns) {
        let query = knex('tasks').select('*');
        if (columns.hasUserId) {
          query = query.where({ user_id: userId });
        }

        const results = await query;
        const todos = results.map((todo) => ({
          ...todo,
          title: todo.title || todo.content || '',
        }));

        res.render('index', {
          title: 'ToDo App',
          todos: todos,
          isAuth: isAuth,
        });
      })
      .catch(function (err) {
        console.error(err);
        res.render('index', {
          title: 'ToDo App',
          isAuth: isAuth,
          errorMessage: [err.sqlMessage],
        });
      });
  } else {
    res.render('index', {
      title: 'ToDo App',
      isAuth: isAuth,
    });
  }
});

router.post('/', async function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (!isAuth) {
    return res.redirect('/signin');
  }

  const userId = req.user.id;
  const todo = req.body.add;

  try {
    const columns = await getTaskColumns();
    const taskData = {};

    if (columns.hasUserId) {
      taskData.user_id = userId;
    }
    if (columns.hasContent) {
      taskData.content = todo;
    } else if (columns.hasTitle) {
      taskData.title = todo;
    } else {
      taskData.title = todo;
    }
    if (columns.hasStatus) {
      taskData.status = 'incomplete';
    }

    await knex('tasks').insert(taskData);
    return res.redirect('/');
  } catch (err) {
    console.error(err);
    return res.render('index', {
      title: 'ToDo App',
      isAuth: isAuth,
      errorMessage: [err.sqlMessage],
    });
  }
});

router.delete('/delete/:id', async function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (!isAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.id;
  const taskId = req.params.id;

  try {
    const columns = await getTaskColumns();
    let query = knex('tasks').where({ id: taskId });

    if (columns.hasUserId) {
      query = query.andWhere({ user_id: userId });
    }

    await query.del();
    return res.status(200).json({ message: 'Success' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;