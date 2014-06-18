/**
 * Server: the program's entry point
 */
"use strict";
var express = require("express")
  //stuff
  , http  = require("http")
  , path  = require("path")
  //database
  , mongoose = require("mongoose")
  //authentication
  , passport = require("passport")
  , User = require("./apps/models/account")
  , LocalStrategy = require("passport-local").Strategy;

var connect = function () {
  mongoose.connect("mongodb://127.0.0.1:27017/portaldb");
};
connect();

//Error handler
mongoose.connection.on("error", function (err) {
  console.log(err);
});

// Reconnect when closed
mongoose.connection.on("disconnected", function () {
  connect();
});
////////////////////////////
// Authentication support
////////////////////////////
require("./config/passport")(passport);


////////////////////////////
//Express App
////////////////////////////

var app = express()
 , bodyParser = require("body-parser")
 , cookieParser = require("cookie-parser")
 , flash = require("connect-flash")
 , logger = require("logger").createLogger("development.log");

require("./config/express")(app,passport,flash);
//placed here due to __dirname; otherwise, can't find /views
app.use(express.static(path.join(__dirname, "public")));
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "public")));

var exphbs = require("express3-handlebars");

// all environments
app.set("port", process.env.PORT || 80);

////////////////////////////
// Routes
////////////////////////////
require("./routes/routes.js")(app, passport);

////////////////////////////
//Server
////////////////////////////

http.createServer(app).listen(app.get("port"), function(){
  console.log("Express server listening on port " + app.get("port"));
});


