/**
 * Environment
 */
var lgr = require('log4js')
  ,fs = require('fs')
  //topicmap
  ,idx = require('../node_modules/tqtopicmap/index')
  //database
  , mongo = require('mongodb')
  , udb = require('./userdatabase')
  //misc
  , rbuf = require('./util/ringbuffer')
  , constants = require('./constants')
 ;

/**
 * @param callback: signature(err, result) //not actually used to carry information
 */
var Environment = module.exports = function(callback) {
	//create a logging system
	var log;
	var configProperties;
	var database;
	var userdatabase;
	var TopicMapEnvironment;
	var blogRing;
	var wikiRing;
	var tagRing;
	var bookmarkRing;
	var appMenu = [];
	var self = this;
  ///////////////////////
  // API
  ///////////////////////
	/////////////////////////
	// Application UI
	/////////////////////////
	self.addApplicationToMenu = function(url, name) {
		if (!appMenu) {appMenu = [];}
		var urx = {};
		urx.url = url;
		urx.name = name;
		appMenu.push(urx);
	},
	self.getApplicationMenu = function() {
		return appMenu;
	},
	
	self.getCoreUIData = function(request) {
		var result = {};
		result.appmenu = appMenu;
		var isAdmin = false;
		var isAuth = request.isAuthenticated();
		console.log("Environment.getCoreUIData "+isAuth);
		if (isAuth) {
			var usx = request.user;
			var creds = usx.credentials;
			console.log("Environment.checkIsAdmin "+creds.length+" "+creds);
			for(var i=0;i<creds.length;i++) {
				console.log("Admin.isAdmin-1 "+creds[i]+" "+constants.ADMIN_CREDENTIALS);
				if (creds[i].trim() === constants.ADMIN_CREDENTIALS) {
					isAdmin = true;
					break;
				}
			}
		}
		result.isAdmin = isAdmin;
		result.isAuthenticated = isAuth;
		result.isNotAuthenticated = !isAuth;
		return result;
	}
	/////////////////////////
	// Recent events recording
	/////////////////////////
	self.addRecentTag = function(locator,label) {
		var d = new Date().getTime();
		TopicMapEnvironment.logDebug("Environment.addRecentTag "+locator+" "+label);
		var d = new Date().getTime();
		tagRing.add(locator,label,d);
		TopicMapEnvironment.logDebug("Environment.addRecentTag-1 "+tagRing.size());
	},
	self.addRecentBlog = function(locator,label) {
		var d = new Date().getTime();
		blogRing.add(locator,label,d);
		TopicMapEnvironment.logDebug("Environment.addRecentBlog "+blogRing.size());
	},
	self.addRecentWiki = function(locator,label) {
		var d = new Date().getTime();
		wikiRing.add(locator,label,d);
		TopicMapEnvironment.logDebug("Environment.addRecentWiki "+wikiRing.size());
	},
	self.addRecentBookmark = function(locator,label) {
		var d = new Date().getTime();
		bookmarkRing.add(locator,label,d);
		TopicMapEnvironment.logDebug("Environment.addRecentBookmark "+wikiRing.size());
	},
	
	self.listRecentTags = function() {
		return tagRing.getReversedData();
	},
	self.listRecentBlogs = function() {
		return blogRing.getReversedData();
	},
	self.listRecentWikis = function() {
		return wikiRing.getReversedData();
	},
	self.listRecentBookmarks = function() {
		return bookmarkRing.getReversedData();
	},

  self.getConfigProperties = function() {
	return configProperties;
  },
  
  self.getIsInvitationOnly = function() {
    return configProperties.invitationOnly;
  },
  self.getIsPrivatePortal = function() {
    return configProperties.portalIsPrivate;
  },
  self.getTopicMapEnvironment = function() {
    return TopicMapEnvironment;
  },

  self.getUserDatabase = function() {
    return userdatabase;
  },
  
  self.getServer = function() {
    return configProperties.server;
  },
  self.getPort = function() {
    return configProperties.port;
  },
  //////////////////////////////////////
  //logging utils
  //////////////////////////////////////
  self.logInfo = function(message) {
    log.info(message);
  },
  self.logDebug = function(message) {
    log.debug(message);
  },
  self.logError = function(message) {
    log.error(message);
  };
  ///////////////////////
  //Populate the environment
  ///////////////////////
	var path = __dirname+"/../config/config.json";
	var path1 = __dirname+"/../config/logger.json";
  //read the config file
  fs.readFile(/*"./config.json"*/path, function(err, configfile) {
    configProperties = JSON.parse(configfile);
    // build the databases and dataprovider
    var MongoClient = mongo.MongoClient;
    lgr.configure(/*"./logger.json"*/path1);
    log = lgr.getLogger("Portal");
    log.setLevel('ERROR');
    //bring up mongo
    //TODO improve the connect string with credentials, etc
    MongoClient.connect("mongodb://localhost:27017/portaldb2", function(err, db) {
      console.log("BOOTING DB "+err+" "+db);
      database = db;
      var myCollection;
      if(!err) {
        console.log("We are connected "+database);
      }
      //now create the user collection
      database.createCollection(constants.USER_COLLECTION, {strict:true}, function(err, collection) {
        console.log('---'+err+" "+collection);
        //create invitation collection
        database.createCollection(constants.INVITATION_COLLECTION, {strict:true}, function(err, collection) {
            console.log('----'+err+" "+collection);
            //user databasea
            userdatabase = new udb(database);
            //now boot the topic map
            var foo = new idx(function(err, environment) { //new tmenv(function(err, environment) {
            	TopicMapEnvironment = environment;
            	blogRing = new rbuf(20, "blog", TopicMapEnvironment);
            	wikiRing= new rbuf(20, "wiki", TopicMapEnvironment);
            	tagRing= new rbuf(20,"tag", TopicMapEnvironment);
            	bookmarkRing = new rbuf(20,"bookmark",TopicMapEnvironment);
            	//fire up the program
            	console.log("ENVIRONMENT TM "+err+" "+TopicMapEnvironment.hello()+" "+self.getIsPrivatePortal());
            	self.logDebug("Portal Environment started ");
            	TopicMapEnvironment.logDebug("PortalEnvironment started "+blogRing);
            	callback("foo","bar");
            });
        });
      });
    });
  });
};

