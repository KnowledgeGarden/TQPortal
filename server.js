/**
 * Server: the program's entry point
 */
var express = require("express")
  , env = require('./core/environment')
  //stuff
  , http  = require("http")
  , path  = require("path")
  , fs = require('fs')
  //authentication
  , passport = require("passport");
 
////////////////////////////
//Environment
// The Environment boots databases and provides logging services
////////////////////////////
var Environment = new env(function(err,env) {
  console.log("Environment started "+Environment.getPort());
  var UserDatabase = Environment.getUserDatabase();
  ////////////////////////////
  // Authentication support
  ////////////////////////////
  require("./core/config/passport")(passport, UserDatabase);
  ////////////////////////////
  //Express App 
  ////////////////////////////

  var app = express()
    , bodyParser = require("body-parser")
    , cookieParser = require("cookie-parser")
    , flash = require("connect-flash");
  //  , logger = require("logger").createLogger("development.log");

  require("./core/config/express")(app,passport,flash);
  //placed here due to __dirname; otherwise, can't find /views
  app.use(express.static(path.join(__dirname, "public")));
  app.set("views", __dirname + "/views");
  app.use(express.static(path.join(__dirname, "public")));

  // all environments
  app.set("port", Environment.getPort());
  ////////////////////////////
  // Routes are added to Express from each plugin app
  // Trailing routes added for 404 errors
  ////////////////////////////

  /**
   * Fire up an individual app from this <code>file</code>
   * @param file: a .js app file which exports a function(app,database)
   */
  function startApp(file) {
    var v = file;
    var p = require('./apps/' + v).plugin;
    p(app, Environment, passport, Environment.getIsPrivatePortal());
   }

  /**
   * load all *.js files from the /apps directory
   */
  function loadApps() {
    require('fs').readdirSync('./apps').forEach(function (file) {
      // only load javascript files
      if (file.indexOf(".js") > -1) {
        console.log('BURP '+file);
        startApp(file);
      }
    });
  }
  // boot the plugin apps
  loadApps();
  
  ////////////////////////////
  //Server
  //TODO need to use server and port, not just port
  ////////////////////////////
 // console.log("Server "+app);
  //console.log("Server2 "+app.get("port"));

  http.createServer(app).listen(app.get("port"), function() {
    console.log("Express server listening on port " + app.get("port"));
  });

});


