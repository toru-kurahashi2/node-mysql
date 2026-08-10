const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

function formatDeadline(deadline) {
  if (!deadline) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    const [year, month, day] = deadline.split('-').map(Number);
    return `${month}月${day}日`;
  }

  return deadline;
}

function parseDeadline(deadline) {
  if (!deadline) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    const [year, month, day] = deadline.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const match = deadline.match(/^(\d{1,2})月(\d{1,2})日$/);
  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const currentYear = new Date().getFullYear();

  return new Date(currentYear, month - 1, day);
}

function getRemainingDays(deadline) {
  const deadlineDate = parseDeadline(deadline);
  if (!deadlineDate) {
    return Number.MAX_SAFE_INTEGER;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  return Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
}

function ensureTasksTable() {
  return knex.schema.hasTable('tasks').then(function (exists) {
    if (!exists) {
      return knex.schema.createTable('tasks', function (table) {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.string('content').notNullable();
        table.string('note').nullable();
        table.string('deadline').nullable();
      });
    }

    return knex.schema.hasColumn('tasks', 'note').then(function (hasColumn) {
      if (!hasColumn) {
        return knex.schema.table('tasks', function (table) {
          table.string('note').nullable();
        });
      }
    }).then(function () {
      return knex.schema.hasColumn('tasks', 'deadline').then(function (hasColumn) {
        if (!hasColumn) {
          return knex.schema.table('tasks', function (table) {
            table.string('deadline').nullable();
          });
        }
      });
    });
  });
}

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const sortType = req.query.sort === 'deadline' ? 'deadline' : 'created';

  if (isAuth) {
    const userId = req.user.id;
    ensureTasksTable()
      .then(function () {
        return knex('tasks')
          .select('id', 'content', 'note', 'deadline')
          .where({user_id: userId})
          .orderBy('id', 'asc');
      })
      .then(function (results) {
        if (sortType === 'deadline') {
          results.sort(function (a, b) {
            const remainingA = getRemainingDays(a.deadline);
            const remainingB = getRemainingDays(b.deadline);

            if (remainingA === remainingB) {
              return a.id - b.id;
            }

            return remainingA - remainingB;
          });
        }

        res.render('index', {
          title: 'ToDo App',
          todos: results,
          isAuth: isAuth,
          sortType: sortType,
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

router.post('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (!isAuth) {
    return res.redirect('/signin');
  }

  const userId = req.user.id;
  const todo = req.body.add;
  const note = req.body.note;
  const deadline = req.body.deadline;
  const sortType = req.body.sort || 'created';

  if (!todo || !todo.trim()) {
    return res.redirect('/');
  }

  ensureTasksTable()
    .then(function () {
      return knex('tasks').insert({
        user_id: userId,
        content: todo.trim(),
        note: note ? note.trim() : null,
        deadline: deadline ? formatDeadline(deadline.trim()) : null,
      });
    })
    .then(function () {
      const query = sortType === 'deadline' ? '?sort=deadline' : '';
      res.redirect('/' + query);
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'ToDo App',
        isAuth: isAuth,
        errorMessage: [err.sqlMessage],
      });
    });
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;