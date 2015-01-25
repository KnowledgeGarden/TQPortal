/**
 * Environment
 */
var //lgr = require('log4js'),
    fs = require('fs'),
    //topicmap
    Indx = require('tqtopicmap'),
    //database
//    Udb = require('./userdatabase'),
    Udes = require('./userdatabaseES'),
    //logging platform
    Lp = require('./logplatform'),
    //game environment
    Genv = require('../apps/rpg/rpgenvironment'),
    //misc
    rbuf = require('./util/ringbuffer'),
    constants = require('./constants'),
    Cm = require('../apps/common/commonmodel'),
    Pnm = require('../apps/common/portalnodemodel')
 ;

/**
 * @param callback: signature(err, result) // result is the environment
 */
var Environment = function(callback) {  //function(callback) {
	console.log("Environment A");
	//create a logging system
	var logApp,
		logger,
        monitorLogger,
        apiLogger,
        configProperties,
        helpMenuProperties,
        database,
        userdatabase,
        CommonModel,
        PortalNodeModel,
        TopicMapEnvironment,
        RPGEnvironment,
        //NOTE: there is a plan to move these ringbuffers out to the apps
        //see saveRecentListeners below
        blogRing,
        wikiRing,
        tagRing,
        conversationRing,
        connectionRing,
        bookmarkRing,
        transcludeRing,
        appMenu = [],
        helpMenu = [],
        theMessage = "",
        //A list of Environment objects from apps which
        // need to save their recents and other things
        saveRecentListeners = [];

    var self = this;

    /**
     * Primary bootup
     */
	self.init = function(callback) {
		///////////////////////
		//Populate the environment
		///////////////////////
		var path = __dirname+"/../config/config.json",
			recentspath = __dirname+"/../config/recents.json",
			helppath = __dirname+"/../config/help.json";
			
		var myself = this;

		//get the logs
		logApp = new Lp(function(logp) {
			logApp = logp;
			logger = logApp.getLogger();
			    console.log("AAAA "+logger.category);

			logger.debug("TQPortalEnvironment just getting started");
			monitorLogger = logApp.getMonitorLogger();
			apiLogger = logApp.getAPILogger();
			//read the config file
			fs.readFile(path, function(err, configfile) {
				configProperties = JSON.parse(configfile);
				fs.readFile(helppath, function(err, helpfile) {  
					helpMenuProperties = JSON.parse(helpfile);
					helpMenu = helpMenuProperties.helpMenu;
					if (!helpMenu) {helpMenu = [];}
					logger.debug("TQPortalEnvironment just getting started 2");

					//bring up mongo
					//TODO improve the connect string with credentials, etc
//					userdatabase = new Udb(configProperties, function(err, dx) {
					//Bring up the topicmap
		            var foo = new Indx(function(err, tmx) {
		                TopicMapEnvironment = tmx;
		                logger.debug("TQPortalEnvironment just getting started 3");
		                //grab ESClient from the topic map
		                var esclient = TopicMapEnvironment.getDatabase();
		                //now bring up the userdatabase using elasticsearch
		                			

						userdatabase = new Udes(this, esclient, configProperties, function(err, dx) {
										logger.debug("TQPortalEnvironment just getting started 4");

				            //user databasea
				            //userdatabase = dx;
				            //now boot the topic map
				            logger.debug("Environment AA "+err+" | ");
			                logger.debug("Environment B");
			                // boot the game environment
			                RPGEnvironment = new Genv(this, TopicMapEnvironment);
			                //load recents
			                fs.readFile(recentspath, function(err, recents) {
			                    var rx = JSON.parse(recents);
			                    console.log("RECENTS "+err+" "+JSON.stringify(rx));
			                    blogRing = new rbuf(20, "blog", TopicMapEnvironment);
			                    wikiRing= new rbuf(20, "wiki", TopicMapEnvironment);
			                    tagRing= new rbuf(20,"tag", TopicMapEnvironment);
			                    bookmarkRing = new rbuf(20,"bookmark",TopicMapEnvironment);
			                    conversationRing = new rbuf(20,"conversation",TopicMapEnvironment);
			                    connectionRing = new rbuf(20, "Connections", TopicMapEnvironment);
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
			                    CommonModel = new Cm(this, TopicMapEnvironment);
			                    PortalNodeModel = new Pnm(this,TopicMapEnvironment, CommonModel);
			                    //fire up the program
			                    console.log("ENVIRONMENT TM "+err+" "+TopicMapEnvironment.hello()+" "+self.getIsPrivatePortal());
			                    self.logDebug("Portal Environment started ");
			                    self.logMonitorDebug("Portal Environment started ");
			                    self.logAPIDebug("Portal Environment started ");
			                    TopicMapEnvironment.logDebug("PortalEnvironment started "+blogRing);
			                    logger.debug("Environment C");
			                    return callback("foo", myself);  	
			                }); // recents
			            });  // userdatabase
					}); //topicmap
				}); 
		    }); //config
		}); //logging
	}; //init


/*	self = this;
	self.start = function(callback) {
		console.log("ENVIRONMENT STARTING")
		this.init(function (err, data) {
			return callback(err, data);
		});
	}; */

	///////////////////////
	// API
	///////////////////////
	/**
	 * Register an environment which must save recents
	 */
	self.addRecentListener = function(listener) {
		if (!saveRecentListeners) {saveRecentListeners = [];}
		saveRecentListeners.push(listener);
	};
	/////////////////////////
	// Application UI
	/////////////////////////
	self.setMessage = function(message) {
		console.log("SETTING MESSAGE "+message)
		theMessage = message;
	};
	self.clearMessage = function() {
		theMessage = "";
	};

	self.persistRecents = function() {
		var recentspath = __dirname+"/../config/recents.json";
		var dx = {};
		dx.blog = self.listRecentBlogs();
		dx.wiki = self.listRecentWikis();
		dx.tag = self.listRecentTags();
		dx.convers = self.listRecentConversations();
        dx.connections = self.listRecentConnections();
		dx.bkmrk = self.listRecentBookmarks();
		fs.writeFileSync(recentspath, JSON.stringify(dx));
		if (saveRecentListeners) {
			var len = saveRecentListeners.length;
			for (var i=0;i<len;i++) {
				saveRecentListeners[i].persistRecents();
			}
		}
	};

    self.saveHelp = function() {
        var path = __dirname+"/../config/help.json";
		fs.writeFileSync(path, JSON.stringify(helpMenuProperties));
    };
	self.saveProperties = function() {
		var path = __dirname+"/../config/config.json";
		fs.writeFileSync(path, JSON.stringify(configProperties));
	};
	self.addApplicationToMenu = function(url, name) {
		if (!appMenu) {appMenu = [];}
		var urx = {};
		urx.url = url;
		urx.name = name;
		appMenu.push(urx);
	};
	self.getApplicationMenu = function() {
		return appMenu;
	};
	
	self.addConversationToHelp = function(url, name) {
		if (!helpMenuProperties) {helpMenuProperties = {};}
        var helpx = helpMenuProperties.helpMenu;
        if (!helpx) {helpx = []};
		var urx = {};
		urx.url = url;
		urx.name = name;
		helpx.push(urx);
        helpMenuProperties.helpMenu = helpx;
		
		self.saveHelp();
	};

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
	};
	
	self.getCommonModel = function() {
		return CommonModel;
	};
	self.getPortalNodeModel = function() {
		return PortalNodeModel;
	};

	/////////////////////////
	// Recent events recording
	//TODO move these to applications, and let them install
	// listeners here to fetch them when needed
	/////////////////////////
	self.addRecentTag = function(locator,label) {
		var d = new Date().getTime();
		var d = new Date().getTime();
		tagRing.add(locator,label,d);
	};
	self.addRecentBlog = function(locator,label) {
		var d = new Date().getTime();
		blogRing.add(locator,label,d);
	},
	self.addRecentWiki = function(locator,label) {
		var d = new Date().getTime();
		wikiRing.add(locator,label,d);
	};
	self.addRecentBookmark = function(locator,label) {
		var d = new Date().getTime();
		bookmarkRing.add(locator,label,d);
	};
	self.addRecentConversation = function(locator,label) {
		var d = new Date().getTime();
		conversationRing.add(locator,label,d);
	};
    self.addRecentConnection = function(locator,label) {
        var d = new Date().getTime();
        connectionRing.add(locator,label,d);
    };
	
	self.listRecentTags = function() {
		return tagRing.getReversedData();
	};
	self.listRecentBlogs = function() {
		return blogRing.getReversedData();
	};
	self.listRecentWikis = function() {
		return wikiRing.getReversedData();
	};
	self.listRecentBookmarks = function() {
		return bookmarkRing.getReversedData();
	},
	self.listRecentConversations = function() {
		return conversationRing.getReversedData();
	};

    self.listRecentConnections = function() {
        return connectionRing.getReversedData();
    };
	self.getConfigProperties = function() {
		return configProperties;
	};
	
	self.getIsInvitationOnly = function() {
	  return configProperties.invitationOnly;
	};
	self.getIsPrivatePortal = function() {
	  return configProperties.portalIsPrivate;
	};
        
	self.getTopicMapEnvironment = function() {
	  return TopicMapEnvironment;
	};
	
    self.getRPGEnvironment = function () {
        return RPGEnvironment;
    };
        
	self.getUserDatabase = function() {
	  return userdatabase;
	};
	
	self.getServer = function() {
	  return configProperties.server;
	};
	self.getPort = function() {
	  return configProperties.port;
	};
	//////////////////////////////////////
	//logging utils
	//////////////////////////////////////
	self.logInfo = function(message) {
		logger.info(message);
	};
	self.logDebug = function(message) {
		console.log("LOGDEBUG "+logger+" "+message);
		logger.debug(message);
	};
	self.logError = function(message) {
		logger.error(message);
	};
	self.logMonitorDebug = function(message) {
		monitorLogger.debug(message);
	};
	self.logMonitorError = function(message) {
		monitorLogger.error(message);
	};
	self.logAPIDebug = function(message) {
		apiLogger.debug(message);
	};
	self.logAPIError = function(message) {
		apiLogger.error(message);
	};
	self = this;
	console.log("ENVIRONMENT END");
	self.init(function(err,data) {
		self.logDebug("FUCK");
		logger.debug("FUCK MORE");
		//self = this;
		callback( err, self);
	});

};

module.exports = Environment;
