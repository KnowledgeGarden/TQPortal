/**
 * Environment
 */
var lgr = require('log4js')
  ,fs = require('fs')
  //topicmap
  ,idx = require('../node_modules/tqtopicmap/index')
  //database
  , udb = require('./userdatabase')
  //logging platform
  , lp = require('./logplatform')
//  , plogger = require('./logging/plogger')
//  , mlogger = require('./logging/mlogger')
//  , alogger = require('./logging/alogger')
  //misc
  , rbuf = require('./util/ringbuffer')
  , constants = require('./constants')
  , cm = require('../apps/common/commonmodel')
 ;

/**
 * @param callback: signature(err, result) //not actually used to carry information
 */
var Environment = module.exports = function(callback) {
	//create a logging system
	var logger;
	var monitorLogger;
	var apiLogger;
	var configProperties;
	var database;
	var userdatabase;
	var CommonModel;
	var TopicMapEnvironment;
	var blogRing;
	var wikiRing;
	var tagRing;
	var conversationRing;
	var bookmarkRing;
	var transcludeRing;
	var appMenu = [];
	var helpMenu = [];
	var theMessage = "";
	var self = this;

self.init = function() {
	///////////////////////
	//Populate the environment
	///////////////////////
	var path = __dirname+"/../config/config.json";
	var recentspath = __dirname+"/../config/recents.json";
	//get the logs
	var lgr = new lp(function(logp) {
		logger = logp.getLogger();
		monitorLogger = logp.getMonitorLogger();
		apiLogger = logp.getAPILogger();
  //read the config file
  fs.readFile(path, function(err, configfile) {
    configProperties = JSON.parse(configfile);
    helpMenu = configProperties.helpMenu;
    if (!helpMenu) {helpMenu = [];}
    //bring up mongo
    //TODO improve the connect string with credentials, etc
    userdatabase = new udb(configProperties, function(err,dx) {
    	//user databasea
    	//userdatabase = dx;
    	//now boot the topic map
    	var foo = new idx(function(err, environment) {
    		TopicMapEnvironment = environment;
    		//load recents
    		fs.readFile(recentspath, function(err, recents) {
    			var rx = JSON.parse(recents);
    			console.log("RECENTS "+err+" "+JSON.stringify(rx));
    			blogRing = new rbuf(20, "blog", TopicMapEnvironment);
    			wikiRing= new rbuf(20, "wiki", TopicMapEnvironment);
    			tagRing= new rbuf(20,"tag", TopicMapEnvironment);
    			bookmarkRing = new rbuf(20,"bookmark",TopicMapEnvironment);
    			conversationRing = new rbuf(20,"conversation",TopicMapEnvironment);
    			transcludeRing = new rbuf(20, "Transcludes",TopicMapEnvironment);
    			var len, ix, i, x = rx.blog;
    			if (x) {
    				len = x.length;
    				for (i=0;i<len;i++) {
    					ix=x[i];
    					self.addRecentBlog(ix.locator, ix.label);
    				}
    			}
    			x = rx.wiki;
    			if (x) {
    				len = x.length;
    				for (i=0;i<len;i++) {
    					ix=x[i];
    					self.addRecentWiki(ix.locator, ix.label);
    				}
    			}
    			x = rx.tag;
    			if (x) {
    				len = x.length;
    				for (i=0;i<len;i++) {
    					ix=x[i];
    					self.addRecentTag(ix.locator, ix.label);
    				}
    			}
    			x = rx.bkmrk;
    			if (x) {
    				len = x.length;
    				for (i=0;i<len;i++) {
    					ix=x[i];
    					self.addRecentBookmark(ix.locator, ix.label);
    				}
    			}
    			x = rx.convers;
    			if (x) {
    				len = x.length;
    				for (i=0;i<len;i++) {
    					ix=x[i];
    					self.addRecentConversation(ix.locator, ix.label);
    				}
    			}
    			//It is a fact that anything constructed below cannot call this Environment
    			// since it is not yet finished building
    			theMessage = "";
    			CommonModel = new cm(this, TopicMapEnvironment);
    			//fire up the program
    			console.log("ENVIRONMENT TM "+err+" "+TopicMapEnvironment.hello()+" "+self.getIsPrivatePortal());
    			self.logDebug("Portal Environment started ");
    			self.logMonitorDebug("Portal Environment started ");
    			self.logAPIDebug("Portal Environment started ");
    			TopicMapEnvironment.logDebug("PortalEnvironment started "+blogRing);
    			callback("foo","bar");  	
    		}); // read file
        });  // foo topicmap
      }); //udb
    }); //config
	}); //logging
}; //init
self.init();

///////////////////////
// API
///////////////////////
	/////////////////////////
	// Application UI
	/////////////////////////
	self.setMessage = function(message) {
		console.log("SETTING MESSAGE "+message)
		theMessage = message;
	},
	self.clearMessage = function() {
		theMessage = "";
	},
	self.persistRecents = function() {
		var recentspath = __dirname+"/../config/recents.json";
		var dx = {};
		dx.blog = self.listRecentBlogs();
		dx.wiki = self.listRecentWikis();
		dx.tag = self.listRecentTags();
		dx.convers = self.listRecentConversations();
		dx.bkmrk = self.listRecentBookmarks();
		fs.writeFileSync(recentspath, JSON.stringify(dx));
	},
	self.saveProperties = function() {
		var path = __dirname+"/../config/config.json";
		fs.writeFileSync(path, JSON.stringify(configProperties));
	},
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
	
	self.addConversationToHelp = function(url, name) {
		if (!helpMenu) {helpMenu = [];}
		var urx = {};
		urx.url = url;
		urx.name = name;
		helpMenu.push(urx);
		
		configProperties.helpMenu = helpMenu;
		self.saveProperties();
	},
	self.getCoreUIData = function(request) {
		console.log("FFF "+JSON.stringify(helpMenu));
		var result = {};
		var brand = configProperties.brand;
		if (!brand) {brand = "NoBrand";}
		result.brand = brand;
		result.appmenu = appMenu;
		result.helpMenu = helpMenu;
		var isAdmin = false;
		var isAuth = request.isAuthenticated();
		console.log("Environment.getCoreUIData "+isAuth);
		if (isAuth) {
			var usx = request.user;
			result.userlocator = usx.handle;
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
		if (!theMessage) {theMessage=""};
		if (theMessage.length > 1) {
			console.log("THEMESSAGE "+theMessage);
			result.themessage = theMessage;
		}
		result.isAdmin = isAdmin;
		result.isAuthenticated = isAuth;
		result.isNotAuthenticated = !isAuth;
		return result;
	},
	
	self.getCommonModel = function() {
		return CommonModel;
	},
	/////////////////////////
	// Recent events recording
	//TODO move these to applications, and let them install
	// listeners here to fetch them when needed
	/////////////////////////
	self.addRecentTag = function(locator,label) {
		var d = new Date().getTime();
//		TopicMapEnvironment.logDebug("Environment.addRecentTag "+locator+" "+label);
		var d = new Date().getTime();
		tagRing.add(locator,label,d);
//		TopicMapEnvironment.logDebug("Environment.addRecentTag-1 "+tagRing.size());
	},
	self.addRecentBlog = function(locator,label) {
		var d = new Date().getTime();
		blogRing.add(locator,label,d);
//		TopicMapEnvironment.logDebug("Environment.addRecentBlog "+blogRing.size());
	},
	self.addRecentWiki = function(locator,label) {
		var d = new Date().getTime();
		wikiRing.add(locator,label,d);
//		TopicMapEnvironment.logDebug("Environment.addRecentWiki "+wikiRing.size());
	},
	self.addRecentBookmark = function(locator,label) {
		var d = new Date().getTime();
		bookmarkRing.add(locator,label,d);
//		TopicMapEnvironment.logDebug("Environment.addRecentBookmark "+wikiRing.size());
	},
	self.addRecentConversation = function(locator,label) {
		var d = new Date().getTime();
		conversationRing.add(locator,label,d);
	//	TopicMapEnvironment.logDebug("Environment.addRecentConversation "+wikiRing.size());
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
	self.listRecentConversations = function() {
		return conversationRing.getReversedData();
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
		logger.info(message);
	},
	self.logDebug = function(message) {
		logger.debug(message);
	},
	self.logError = function(message) {
		logger.error(message);
	},
	self.logMonitorDebug = function(message) {
		monitorLogger.debug(message);
	},
	self.logMonitorError = function(message) {
		monitorLogger.error(message);
	},
	self.logAPIDebug = function(message) {
		apiLogger.debug(message);
	},
	self.logAPIError = function(message) {
		apiLogger.error(message);
	};
};

