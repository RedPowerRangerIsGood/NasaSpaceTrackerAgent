require("dotenv").config();

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

const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const { GoogleGenAI } = require("@google/genai");

var app = express();

// for local development, you can use the .env file to set environment variables
app.use(cors());

console.log("Mongo URI exists:", !!process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("MongoDB connection error:", error.message));

// const { GoogleGenAI } = require('@google/genai');

// const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
// const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/token', tokenRouter);

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
