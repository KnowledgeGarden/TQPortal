/**
 * User Model
 * <p>Creates a <em>Topic</em> for each new account; that's the user identity
 * that will be traded in the database, not the user's _id</p>
 * <p>User's handle must be unique and is used as the locator for that topic</p>
 */

var types = require('../../node_modules/tqtopicmap/lib/types')
  , icons = require('../../node_modules/tqtopicmap/lib/icons')
  , properties = require('../../node_modules/tqtopicmap/lib/properties')
  , constants = require('../../core/constants');

var UserModel = module.exports = function(environment) {
  var topicMapEnvironment = environment.getTopicMapEnvironment();
  var Dataprovider = topicMapEnvironment.getDataProvider();
  var topicModel = topicMapEnvironment.getTopicModel();

  var self = this;
	
  /**
   * Update an existing user entry
   */
  self.update = function(userbody,user,credentials,callback) {
	  topicMapEnvironment.logDebug("USER.UPDATE "+JSON.stringify(userbody));
	  var lox = userbody.locator;
	  Dataprovider.getNodeByLocator(lox, credentials, function(err,result) {
		  var error = '';
		  if (err) {error += err;}
		  var body = userbody.body;
    	  var lang = userbody.language;
    	  var comment = "an edit"; //TODO add comment field to form
    	  if (!lang) {lang = "en";}
    	  result.updateBody(body,lang,user.handle,comment);
    	  Dataprovider.putNode(result, function(err,data) {
    		  if (err) {error += err;}
    		  callback(error,data);
    	  });
	  });
  },

  /**
   * Create a new user Topic from an authenticated User object
   * @param user = User, the authentication user, not the topic user
   * @param callback signature (err,data)
   */
  self.newUserTopic = function(user, callback) {
    //NOTE: user.handle is also the topic's locator
    //must be unique
    console.log('USER.newUserTopic- '+JSON.stringify(user.getData()));
    var language = "en"; //TODO
    var credentials = []; 
    credentials.push(user.getHandle());
    // In fact, we already check for valid and unique handle in routes.js
    console.log('USER.newUserTopic-1 '+user.getHandle());
    self.findUser(user.getHandle(), credentials, function(err,result) {
      console.log('USER.newUserTopic-2 '+err+' '+result);
      //if (result !== null) {
      if (result != null /*&& result.length > 0*/) {
        callback(user.getHandle()+" already exists", null);
      } else {
        //create a new user
    	var usr;
        topicModel.newInstanceNode(user.getHandle(), types.USER_TYPE,
        		"","","en",user.getHandle(),
        		icons.PERSON_ICON_SM,icons.PERSON_ICON, false, credentials, function(err,result) {
            console.log('USER.newUserTopic-3 '+err+' '+result.toJSON());
        	usr = result;
        	// model users as AIR objects
        	usr.setSubject(user.getFullName(),language, user.getHandle());
        	//model user's home page in this topic
        	if (user.getHomepage()) {
        		usr.setResourceUrl(user.getHomepage());
        	}
          Dataprovider.putNode(usr, function(err,data) {
            console.log('UserModel.newUserTopic+ '+usr.getLocator()+" "+err);
            callback(err,null);
          });
        });
      }
 	});
  },
	
  /**
   * Find user topic given <code>userLocator</code>
   * @param userlocator
   * @param credentials
   * @param callback signature (err,data)
   */
  self.findUser = function(userLocator, credentials, callback) {
	  console.log("UserModel.findUser "+userLocator+" "+credentials);
    Dataprovider.getNodeByLocator(userLocator, credentials, function(err,result) {
      callback(err,result);
    });
  },
  
  self.listUsers = function(start, count, credentials, callback) {
    Dataprovider.listInstanceNodes(types.USER_TYPE, start,count,credentials, function(err,data) {
      console.log("UserModel.listInstanceNodes "+err+" "+data);
      callback(err,data);
    });
  },
	  
	  /**
	   * @param credentials
	   * @param callback signatur (data)
	   */
  self.fillDatatable = function(credentials, callback) {
    var theResult = {};
    self.listUsers(0,-1,credentials,function(err,result) {
      console.log('ROUTES/users '+err+' '+result);
      var data = [];
      var len = result.length;
      var p; //the proxy
      var m; //the individual message
      var url;
      var posts = [];
      for (var i=0;i<len;i++) {
      p = result[i];
		        m = [];
		        url = "<a href='user/"+p.getLocator()+"'>"+p.getSubject(constants.ENGLISH).theText+"</a>";
		        m.push(url);
		        data.push(m);
		      }
		      theResult.data = data;
		      console.log();
		      console.log("TagModel.fillDatatable "+JSON.stringify(theResult));
		      console.log();
		    callback(theResult);
		  });
	  }
};