/**
 * Wiki model
 */
var constants = require('../../core/constants')
  , types = require('../../node_modules/tqtopicmap/lib/types')
  , icons = require('../../node_modules/tqtopicmap/lib/icons')
  , properties = require('../../node_modules/tqtopicmap/lib/properties')
 
  , uuid = require('../../core/util/uuidutil')
  , tagmodel = require('../tag/tagmodel');

var WikiModel =  module.exports = function(environment) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var TagModel = new tagmodel(environment);
	var self = this;
  /**
   * Create a new wiki topic
   * @param wiki: a JSON object filled in
   * @user: a User object to be converted to a userTopic
   */
  self.create = function (wiki, user, callback) {
	  topicMapEnvironment.logDebug("WikiModel.create "+JSON.stringify(wiki));
    var userLocator = user.handle; // It's supposed to be user.handle;
    //first, fetch this user's topic
    var credentials = user.credentials;
    var userTopic;
    Dataprovider.getNodeByLocator(userLocator, credentials, function(err,result) {
    	userTopic = result;
    	console.log('WikiModel.create-1 '+userLocator+' | '+userTopic);
    	// create the blog post
    	console.log("FOO "+types.WIKI_TYPE);
    	TopicModel.newInstanceNode(uuid.newUUID(), types.WIKI_TYPE,
    			wiki.title, wiki.body, constants.ENGLISH, userLocator,
    			icons.PUBLICATION_SM, icons.PUBLICATION, false, credentials, function(err, article) {
    		console.log('WikiModel.create-2 '+article.toJSON());
    		// now deal with tags
    		var tags = wiki.tags;
    		if (tags.indexOf(',') > -1) {
    			var tagList = tags.split(',');
    			TagModel.processTagList(tagList, userTopic, article, credentials, function(err,result) {
    				topicMapEnvironment.logDebug('NEW_POST-1 '+result);
    				//result could be an empty list;
    				//TagModel already added Tag_Doc and Doc_Tag relations
    				console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
    				Dataprovider.putNode(article, function(err,data) {
    					console.log('ARTICLES_CREATE-3 '+err);	  
    					if (err) {console.log('ARTICLES_CREATE-3a '+err)}
    					console.log('ARTICLES_CREATE-3b '+userTopic);	  
    					TopicModel.relateExistingNodes(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
    							userTopic.getLocator(),
    							icons.RELATION_ICON, icons.RELATION_ICON, false, false, credentials, function(err,data) {
    						if (err) {console.log('ARTICLES_CREATE-3d '+err);}
    						console.log("WikiModel.create-A "+article.toJSON());
    						callback(err,article.getLocator());
    					}); //r1
    				}); //putnode 		  
    			}); // processtaglist
    		} else {
    			TagModel.processTag(tags, userTopic, article, credentials, function(err,result) {
    				topicMapEnvironment.logDebug('NEW_POST-2 '+result);
    				//result is a list of tags already related to doc and user
    				console.log("ARTICLES_CREATE_22 "+JSON.stringify(article));
    				Dataprovider.putNode(article, function(err,data) {
    					console.log('ARTICLES_CREATE-33 '+err);	  
    					if (err) {console.log('ARTICLES_CREATE-33a '+err)};	  
    					TopicModel.relateExistingNodes(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
    							userTopic.getLocator(),
    							icons.RELATION_ICON_SM, icons.RELATION_ICON, false, false, credentials, function(err,data) {
    						if (err) {console.log('ARTICLES_CREATE-3d '+err);}
    						callback(err,article.getLocator());
    					}); //r1
    				}); //putNode
    			});//processTags
    		} // else      	
    	});  
	});
  },

  	self.listWikiPosts = function(start, count, credentials, callback) {
	  Dataprovider.listInstanceNodes(types.WIKI_TYPE, start,count,credentials, function(err,data) {
		  console.log("WikiModel.listBlogPosts "+err+" "+data);
		  callback(err,data);
	  });
	},
	  
	  /**
	   * @param credentials
	   * @param callback signatur (data)
	   */
	  self.fillDatatable = function(credentials, callback) {
		  var theResult = {};
		  self.listWikiPosts(0,-1,credentials,function(err,result) {
		      console.log('ROUTES/blog '+err+' '+result);
		      var data = [];
		      var len = result.length;
		      var p; //the proxy
		      var m; //the individual message
		      var url;
		      var posts = [];
		      for (var i=0;i<len;i++) {
		        p = result[i];
		        m = [];
		        url = "<a href='wiki/"+p.getLocator()+"'>"+p.getLabel(constants.ENGLISH)+"</a>";
		        m.push(url);
		        url = "<a href='user/"+p.getCreatorId()+"'>"+p.getCreatorId()+"</a>";
		        m.push(url);
		        m.push(p.getDate());
		        data.push(m);
		      }
		      theResult.data = data;
		      console.log();
		      console.log("WikiModel.fillDatatable "+JSON.stringify(theResult));
		      console.log();
		    callback(theResult);
		  });
	  }
};