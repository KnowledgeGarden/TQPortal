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
	var CommonModel = environment.getCommonModel();
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var queryDSL = topicMapEnvironment.getQueryDSL();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var TagModel = new tagmodel(environment);
	var self = this;
	
	  /**
	   * Update an existing wiki entry; no tags included
	   */
	  self.update = function(blog,user,callback) {
		  topicMapEnvironment.logDebug("WIKI.UPDATE "+JSON.stringify(blog));
		  var credentials = user.credentials;
		  var lox = blog.locator;
		  Dataprovider.getNodeByLocator(lox, credentials, function(err,result) {
			  var error = '';
			  if (err) {error += err;}
			  var title = blog.title;
			  var body = blog.body;
	    	  var lang = blog.language;
	    	  var comment = "an edit"; //TODO add comment field to form
	    	  if (!lang) {lang = "en";}
	    	  result.updateSubject(title,lang,user.handle,comment);
	    	  result.updateBody(body,lang,user.handle,comment);
	    	  result.setLastEditDate(new Date());
	    	  Dataprovider.putNode(result, function(err,data) {
	    		  if (err) {error += err;}
	    		  callback(error,data);
	    	  });
		  });
	  },
	  
	  self.update = function(blog,user,credentials,callback) {
		  topicMapEnvironment.logDebug("Bookmark.UPDATE "+JSON.stringify(blog));
		  var lox = blog.locator;
		  Dataprovider.getNodeByLocator(lox, credentials, function(err,result) {
			  var error = '';
			  if (err) {error += err;}
			  var title = blog.title;
			  var body = blog.body;
	    	  var lang = blog.language;
	    	  var comment = "an edit"; //TODO add comment field to form
	    	  if (!lang) {lang = "en";}
	    	  result.updateSubject(title,lang,user.handle,comment);
	    	  result.updateBody(body,lang,user.handle,comment);
	    	  result.setLastEditDate(new Date());

	    	  Dataprovider.putNode(result, function(err,data) {
	    		  if (err) {error += err;}
	    		  callback(error,data);
	    	  });
		  });
	  },

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
    var language = constants.ENGLISH; //TODO
    var userTopic;
    Dataprovider.getNodeByLocator(userLocator, credentials, function(err,result) {
    	userTopic = result;
    	console.log('WikiModel.create-1 '+userLocator+' | '+userTopic);
    	// create the blog post
    	console.log("FOO "+types.WIKI_TYPE);
    	TopicModel.newInstanceNode(uuid.newUUID(), types.WIKI_TYPE,
    			"","", language, userLocator,
    			icons.PUBLICATION_SM, icons.PUBLICATION, false, credentials, function(err, article) {
    		//model wiki topic as AIR
    		article.setSubject(wiki.title,language,userLocator);
    		article.setBody(wiki.body,language,userLocator);
    		console.log('WikiModel.create-2 '+article.toJSON());
    		topicMapEnvironment.logDebug("WikiModel adding ring "+myEnvironment);
			myEnvironment.addRecentWiki(article.getLocator(),wiki.title);
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

    					TopicModel.relateExistingNodesAsPivots(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
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
    					TopicModel.relateExistingNodesAsPivots(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
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
	  var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.WIKI_TYPE,start,count);
	  Dataprovider.listNodesByQuery(query, start,count,credentials, function(err,data) {
		  console.log("WikiModel.listBlogPosts "+err+" "+data);
		  callback(err,data);
	  });
	},
	  
	  /**
	   * @param credentials
	   * @param callback signatur (data)
	   */
	  self.fillDatatable = function(credentials, callback) {
          self.listWikiPosts(0,100,credentials,function(err,result) {
		      console.log('ROUTES/bookmark '+err+' '+result);
			  CommonModel.fillDatatable(result, "wiki/", function(data) {
				  callback(data);
			  });
		  });
	  }
};