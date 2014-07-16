/**
 * Environment
 */
var lgr = require('log4js')
  ,fs = require('fs')
  //topicmap
  ,idx = require('../node_modules/tqtopicmap/index')
//  ,tmenv = require('../node_modules/tqtopicmap/lib/environment')
  //database
  , mongo = require('mongodb')
   , udb = require('./userdatabase')
  , constants = require('./constants')
 ;

/**
 * @param callback: signature(err, result) //not actually used to carry information
 */
var Environment = module.exports = function(callback) {
	//create a logging system
	var log;
	var self = this;
	var configProperties;
	var database;
	var userdatabase;
	var TopicMapEnvironment;
  ///////////////////////
  // API
  ///////////////////////
  
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
            	//fire up the program
            	console.log("ENVIRONMENT TM "+err+" "+TopicMapEnvironment.hello()+" "+self.getIsPrivatePortal());
            	self.logDebug("Portal Environment started ");
            	callback("foo","bar");
            });
        });
      });
    });
  });
};

