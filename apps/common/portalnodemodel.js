/**
 * PortalNodeModel
 * A common place for node manipulation
 */
var types = require('../../node_modules/tqtopicmap/lib/types'),
    icons = require('../../node_modules/tqtopicmap/lib/icons'),
    properties = require('../../node_modules/tqtopicmap/lib/properties'),
    constants = require('../../core/constants'),
    uuid = require('../../core/util/uuidutil'),
    tagmodel = require('../tag/tagmodel')
;

var PortalNodeModel =  module.exports = function(environment, tmenv, com) {
	var CommonModel = com,
        myEnvironment = environment,
        topicMapEnvironment = tmenv,
        DataProvider = topicMapEnvironment.getDataProvider(),
        TopicModel = topicMapEnvironment.getTopicModel(),
        TagModel,
	
        self = this;
	
	/**
	 * Required to init just after Environment is built, in server.js
	 */
	self.init = function(env) {
		TagModel = new tagmodel(env);
	};
    
	/**
	 * General purpose node creation for all nodes except<br/>
	 * tags, users, conversation
	 * @param json  data from a form which captured node information
	 * @parma user  logged in
	 * @param nodeType
	 * @param smallIcon
	 * @param icon
	 * @param isPrivate <code>true</code> if node is private
	 * @param callback signature (err, data)
	 */
	self.create = function (json, user, nodeType, smallIcon, icon, isPrivate, callback) {
		console.log('BMXXXX '+JSON.stringify(json));
		var credentials = user.credentials;
	    var userLocator = user.handle; // It's supposed to be user.handle;
	    //first, fetch this user's topic
	    var userTopic;
	    DataProvider.getNodeByLocator(userLocator, credentials, function(err,result) {
	      userTopic = result;
	      console.log('PortalNodeModel.create-1 '+userLocator+' | '+userTopic);
	      // create the node
	      //NOTE: we are creating an AIR, which uses subject&body, not label&details
	      TopicModel.newInstanceNode(uuid.newUUID(), nodeType,
	      		"", "", constants.ENGLISH, userLocator,
	      		smallIcon, icon, isPrivate, credentials, function(err, article) {
	    	  var lang = json.language;
	    	  if (!lang) {lang = "en";}
	    	  var subj = json.title;
	    	  var body = json.body;
	    	  article.setSubject(subj,lang,userLocator);
	    	  article.setBody(body.trim(),lang,userLocator);
	    //	  console.log('BlogModel.create-2 '+article.toJSON());
				
	    	     // now deal with tags
				var taglist = CommonModel.makeTagList(json);
	          if (taglist.length > 0) {
	            TagModel.processTagList(taglist, userTopic, article, credentials, function(err,result) {
	              console.log('NEW_POST-1 '+result);
	              //result could be an empty list;
	              //TagModel already added Tag_Doc and Doc_Tag relations
	              console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
	              DataProvider.putNode(article, function(err,data) {
	                console.log('ARTICLES_CREATE-3 '+err);	  
	                if (err) {console.log('ARTICLES_CREATE-3a '+err)}
	                console.log('ARTICLES_CREATE-3b '+userTopic);	  

	                TopicModel.relateExistingNodesAsPivots(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
	                		userTopic.getLocator(),
	                      		icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function(err,data) {
	                    if (err) {console.log('ARTICLES_CREATE-3d '+err);}
	                      callback(err,article.getLocator());
	                 }); //r1
	              }); //putnode 		  
	        	}); // processtaglist
	          }  else {
	              DataProvider.putNode(article, function(err,data) {
	                  console.log('ARTICLES_CREATE-3 '+err);	  
	                  if (err) {console.log('ARTICLES_CREATE-3a '+err)}
	                  console.log('ARTICLES_CREATE-3b '+userTopic);	  

	                  TopicModel.relateExistingNodesAsPivots(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
	                  		userTopic.getLocator(),
	                        		icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function(err,data) {
	                      if (err) {console.log('ARTICLES_CREATE-3d '+err);}
	                        callback(err,article.getLocator());
	                   }); //r1
	                }); //putnode 		  

	          }    	
	      });
	    });
	};
	
	/**
	 * Update an existing node; no tags included
	 * This only works on nodes which are AIRs (tags and users are not AIR nodes)
	 */
	self.update = function(json,user,callback) {
		  myEnvironment.logDebug("PortalNodeModel.update "+JSON.stringify(json));
		  var credentials = user.credentials;
		  var lox = json.locator;
		  DataProvider.getNodeByLocator(lox, credentials, function(err,result) {
			  var error = '';
			  if (err) {error += err;}
			  var title = json.title;
			  var body = json.body;
	    	  var lang = json.language;
	    	  var comment = "an edit by "+user.handle;
	    	  if (!lang) {lang = "en";}
			  var isNotUpdateToBody = true;
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
		    		  console.log("PortalNodeModel.update "+error+" "+oldLabel+" "+title);
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
	  };
	
};