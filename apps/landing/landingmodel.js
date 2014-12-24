/**
 * LandingModel
 */
var types = require('tqtopicmap/lib/types')
	, icons = require('tqtopicmap/lib/icons')
	, properties = require('tqtopicmap/lib/properties')
	, constants = require('../../core/constants')
;
	
var LandingModel =  module.exports = function(environment) {
	var CommonModel = environment.getCommonModel();
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var self = this;
	
	
	self.create = function (blog, user, credentials, callback) {
		  console.log('LMXX '+JSON.stringify(blog));
		// some really wierd shit: the User object for the user database stores
		// as user.handle, but passport seems to muck around and return user.username
	    var userLocator = user.handle; // It's supposed to be user.handle;
	    //first, fetch this user's topic
	    var userTopic;
	//    DataProvider.getNodeByLocator(userLocator, credentials, function(err,result) {
	//      userTopic = result;
	      var lox = blog.locator
	      console.log('LandingModel.create-1 '+lox);
	      // create the blog post
	      console.log("FOO "+types.BLOG_TYPE);
	      //NOTE: we are creating an AIR, which uses subject&body, not label&details
	      TopicModel.newInstanceNode(lox, types.RESOURCE_TYPE,
	      		"", "", constants.ENGLISH, userLocator,
	      		icons.PUBLICATION_SM, icons.PUBLICATION, false, credentials, function(err, article) {
	    	  var lang = blog.language;
	    	  if (!lang) {lang = "en";}
	    	  var body = blog.body;
	    	  article.setBody(body,lang,userLocator);
	    	  DataProvider.putNode(article, function(err,data) {
	    		  callback(err,data);
	    	  });
	      });
	   //   });
	};
	

};