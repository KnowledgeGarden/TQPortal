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
  
  //read the config file
  fs.readFile("./config.json", function(err, configfile) {
    configProperties = JSON.parse(configfile);
    // build the databases and dataprovider
    var MongoClient = mongo.MongoClient;
    lgr.configure("./logger.json");
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
        //user databasea
        userdatabase = new udb(database);
        //now boot the topic map
        var foo = new idx(function(err, environment) {
          TopicMapEnvironment = environment;
          //fire up the program
          console.log("ENVIRONMENT TM "+err+" "+TopicMapEnvironment.hello());
          self.logDebug("Portal Environment started ");
          callback("foo","bar");
        });
      });
    });
  });
};

