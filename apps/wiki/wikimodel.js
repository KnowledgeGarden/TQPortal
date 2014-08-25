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
	var DataProvider = topicMapEnvironment.getDataProvider();
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
		  DataProvider.getNodeByLocator(lox, credentials, function(err,result) {
			  var error = '';
			  if (err) {error += err;}
			  var title = blog.title;
			  var body = blog.body;
	    	  var lang = blog.language;
	    	  var comment = "an edit by "+user.handle;
	    	  var oldBody;
	    	  if(result.getBody(lang)) {
	    		  oldBody = result.getBody(lang).theText;
	    	  }
	    	  if (oldBody) {
	    		  isNotUpdateToBody = (oldBody === body);
	    	  }
	    	  var oldLabel = result.getSubject(lang).theText;
	    	  var isNotUpdateToLabel = (title === oldLabel);
	    	  if (!isNotUpdateToLabel) {
	    		  //crucial update to label
	    		  result.updateSubject(title,lang,user.handle,comment);
	    		  if (!isNotUpdateToBody) {
	    			  result.updateBody(body,lang,user.handle,comment);
	    		  }
		    	  result.setLastEditDate(new Date());
		    	  DataProvider.updateNodeLabel(result, oldLabel, title, credentials, function(err,data) {
		    		  if (err) {error += err;}
		    		  console.log("WikiModel.update "+error+" "+oldLabel+" "+title);
		    		  callback(error,data);
		    	  });
	    	  } else {
	    		  if (!isNotUpdateToBody) {
	    			  result.updateBody(body,lang,user.handle,comment);
	    			  result.setLastEditDate(new Date());
			    	  DataProvider.putNode(result, function(err,data) {
			    		  if (err) {error += err;}
			    		  callback(error,data);
			    	  });
	    		  } else {
	    			  callback(error,null);
	    		  }
	    	  };
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
    DataProvider.getNodeByLocator(userLocator, credentials, function(err,result) {
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
			var taglist = CommonModel.makeTagList(wiki);
    		if (taglist.length > 0) {
    			TagModel.processTagList(taglist, userTopic, article, credentials, function(err,result) {
    				topicMapEnvironment.logDebug('NEW_POST-1 '+result);
    				//result could be an empty list;
    				//TagModel already added Tag_Doc and Doc_Tag relations
    				console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
    				DataProvider.putNode(article, function(err,data) {
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
    		}  	else {
				DataProvider.putNode(article, function(err,data) {
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

    		}
    	});  
	});
  },

  	self.listWikiPosts = function(start, count, credentials, callback) {
	  DataProvider.listInstanceNodes(types.WIKI_TYPE, start,count,credentials, function(err,data,total){
		  console.log("WikiModel.listBlogPosts "+err+" "+data);
		  callback(err,data, total);
	  });
	},
	  
	  /**
	   * @param credentials
	   * @param callback signatur (data)
	   */
	  self.fillDatatable = function(start, count, credentials, callback) {
          self.listWikiPosts(start,count,credentials,function(err,result,totalx) {
		      console.log('ROUTES/bookmark '+err+' '+result);
		      CommonModel.fillSubjectAuthorDateTable(result,"/wiki/",totalx, function(html,len,total) {
			      console.log("FILLING "+start+" "+count+" "+total);
			      callback(html,len,total);
		    	  
		      });
		  });
	  }
};