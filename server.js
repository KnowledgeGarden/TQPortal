/**
 * Server: the program's entry point
 */
var express = require("express"),
	Env = require('./core/environment'),
	Bs = require('tqtopicmap/lib/models/bootstrap'),
	//stuff
	http  = require("http"),
	path  = require("path"),
	fs = require('fs'),
	//authentication
	passport = require("passport")
	//WebSocket
//  , wss = require('./wsserver')
;
 
////////////////////////////
//Environment
// The Environment boots databases and provides logging services
////////////////////////////
var x = new Env(function(err, env) {
	console.log("SERVER A "+env);
	var Environment  =  env;
	//Environment = env;
	Environment.logDebug("Yup");
//	console.log(stop);  // for debugging to stop before loading bootstraps to look at what happened earlier
	var bootstrap = new Bs(Environment.getTopicMapEnvironment()),

		//models/lib/tqtopicmap/node_modules
		bdir = "/../../../../bootstrap"; //path.resolve(__dirname, './bootstrap');
	console.log("SERVER B");
	//now that environment is up, run bootstrap to see
	// if there is new information to add to the index
	bootstrap.bootstrap(bdir, function(berr) {
		console.log("Environment started "+Environment.getPort());
		Environment.logDebug("Server Starting-1 "+berr);
		var UserDatabase = Environment.getUserDatabase();
		////////////////////////////
		// Authentication support
		////////////////////////////
		require("./core/config/passport")(passport, UserDatabase);
		////////////////////////////
		//Express App 
		////////////////////////////

		var app = express()
			bodyParser = require("body-parser"),
			cookieParser = require("cookie-parser"),
			flash = require("connect-flash");
		//   logger = require("logger").createLogger("development.log");
		env.logDebug("Server Starting-2 "+app);
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
			var px = require('./routes/' + v).plugin;
			px(app, Environment, passport, Environment.getIsPrivatePortal());
		}

		/**
		 * load all *.js files from the /routes directory
		 */
		function loadApps() {
			Environment.logDebug("Server Starting-3");
			require('fs').readdirSync('./routes').forEach(function (file) {
				// only load javascript files
				if (file.indexOf(".js") > -1) {
					console.log('BURP '+file);
					startApp(file);
				}
		    });
		}
		// boot the plugin apps
		loadApps();
		Environment.logDebug("Server Starting-4");
		//initialize internal models
		Environment.getPortalNodeModel().init(Environment);
		Environment.logDebug("Server Starting-5");
		//now watch for anything else that comes in which routers don't catch
		//and log it to monitor
		app.get("/*", function(req,res) {
			var path = req.path,
				query = req.query;
			if (query) {query = JSON.stringify(query);}
			var trusted = app.enabled('trust proxy'),
				ip = req.ip,
				msg = "GET: "+path+" | "+query+" | "+ip+" | "+trusted;
			Environment.logMonitorDebug(msg);
			return res.redirect("/");
		});
		  
		app.post("/*", function(req,res) {
			var path = req.path,
				query = req.query;
			if (query) {query = JSON.stringify(query);}
			var trusted = app.enabled('trust proxy'),
				ip = req.ip,
				msg = "POST: "+path+" | "+query+" | "+ip+" | "+trusted;
			Environment.logMonitorDebug(msg);
			return res.redirect("/");
		});
		app.put("/*", function(req,res) {
			var path = req.path,
				query = req.query;
			if (query) {query = JSON.stringify(query);}
			var trusted = app.enabled('trust proxy'),
				ip = req.ip;
				msg = "PUT: "+path+" | "+query+" | "+ip+" | "+trusted;
			Environment.logMonitorDebug(msg);
			return res.redirect("/");
		});
		Environment.logDebug("Server Starting-6");
		////////////////////////////
		//Server
		//TODO need to use server and port, not just port
		////////////////////////////
		// console.log("Server "+app);
		//console.log("Server2 "+app.get("port"));

		http.createServer(app).listen(app.get("port"), function() {
	    	Environment.logDebug("Express server listening on port " + app.get("port"));
		});
		//add a socket for chat rooms
//		  var io = require('socket.io')(http);		
	}); // bootstrap
});


