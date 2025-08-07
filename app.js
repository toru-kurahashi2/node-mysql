const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash'); // ① 新しく追加

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash()); // ② `flash`ミドルウェアを追加

// authorization
require("./config/passport")(app);

// router
// router
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/signin', require('./routes/signin'));
app.use('/signup', require('./routes/signup'));
app.use('/logout', require('./routes/logout'));

// これらをまとめて登録することも可能です
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const signinRouter = require('./routes/signin');
const signupRouter = require('./routes/signup');
const logoutRouter = require('./routes/logout');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/signin', signinRouter);
app.use('/signup', signupRouter);
app.use('/logout', logoutRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;