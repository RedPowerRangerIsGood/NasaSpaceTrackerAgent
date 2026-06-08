var createError = require('http-errors');
var express = require('express');
var path = require('path');
const cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { env } = require('process');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tokenRouter = require('./routes/token');

const { GoogleGenAI } = require("@google/genai");

var app = express();

// for local development, lets you make requests from the frontend to the backend without CORS issues locally
app.use(cors());

// const { GoogleGenAI } = require('@google/genai');

// const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
// const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/token', tokenRouter);
app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// async function generateContent(projectId = GOOGLE_CLOUD_PROJECT, location = GOOGLE_CLOUD_LOCATION) {
//   const client = new GoogleGenAI({
//     vertexai: true,
//     project: projectId,
//     location: location,
//   });

//   const response = await client.models.generateContent({
//     model: 'gemini-3-flash-preview',
//     contents: 'How does AI work?',
//   });

//   console.log(response.text);

//   return response.text;
// }

module.exports = app;
