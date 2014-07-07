/**
 * Express configuration
 */
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , express = require('express')
  , session = require('express-session')
  , path  = require('path')
  , flash = require('connect-flash')
  , exphbs = require('express3-handlebars');
  //, logger = require('logger').createLogger('development.log');

module.exports = function (app,passport,flash) {
  app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');
  //read cookies (needed for auth) https://github.com/expressjs/cookie-parser
  app.use(cookieParser('MyDirty!Little#Secret'));
  //A session is required to for storing cookies
  // This is a memory-store instance
  // Can change this to a persistent store with a JSON object to define database
  app.use(session());
  //get information from html forms https://github.com/expressjs/body-parser
  app.use(bodyParser());
  //required for passport
  app.use(passport.initialize());
  //persistent login sessions
  app.use(passport.session());
  //use connect-flash for flash messages stored in session
  app.use(flash());

};