/**
 * PortalNodeModel
 * A common place for node manipulation
 */
var types = require('tqtopicmap/lib/types'),
    icons = require('tqtopicmap/lib/icons'),
    properties = require('tqtopicmap/lib/properties'),
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
		var credentials = user.credentials,
			error = '',
			userLocator = user.handle; // It's supposed to be user.handle;
	    //first, fetch this user's topic
	    var userTopic;
	    DataProvider.getNodeByLocator(userLocator, credentials, function portalMGetNode(err, result) {
	    	if (err) {error+=err;}
	    	if (result) {
				userTopic = result;
				console.log('PortalNodeModel.create-1 '+userLocator+' | '+userTopic);
				// create the node
				//NOTE: we are creating an AIR, which uses subject&body, not label&details
				TopicModel.newInstanceNode(uuid.newUUID(), nodeType,
									"", "", constants.ENGLISH, userLocator,
									smallIcon, icon, isPrivate, credentials, function portalMNewInstance(err, article) {
					if (err) {error+=err;}
					var lang = json.language;
					if (!lang) {lang = "en";}
					var subj = json.title,
						body = json.body;
					article.setSubject(subj,lang,userLocator);
					article.setBody(body.trim(),lang,userLocator);
		    //	  console.log('BlogModel.create-2 '+article.toJSON());
					
					// now deal with tags
					var taglist = CommonModel.makeTagList(json);
					if (taglist.length > 0) {
						TagModel.processTagList(taglist, userTopic, article, credentials, function portalMProcessTags(err, result) {
							if (err) {error+=err;}
							console.log('NEW_POST-1 '+result);
							//result could be an empty list;
							//TagModel already added Tag_Doc and Doc_Tag relations
							console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
							DataProvider.putNode(article, function portalMPutNode(err, data) {
								if (err) {error+=err;}
								console.log('ARTICLES_CREATE-3 '+err);	  
								if (err) {console.log('ARTICLES_CREATE-3a '+err)}
								console.log('ARTICLES_CREATE-3b '+userTopic);	  

								TopicModel.relateExistingNodesAsPivots(userTopic, article, types.CREATOR_DOCUMENT_RELATION_TYPE,
															userTopic.getLocator(), icons.RELATION_ICON,
															icons.RELATION_ICON, isPrivate, credentials, function portalMRelateNodes(err, data) {
									if (err) {error+=err;}
									return callback(error, article.getLocator());
								}); //r1
							}); //putnode 		  
		        		}); // processtaglist
					} else {
						DataProvider.putNode(article, function portalMPutNode1(err, data) {
							console.log('ARTICLES_CREATE-3 '+err);	  
							if (err) {error+=err;}
							console.log('ARTICLES_CREATE-3b '+userTopic);	  

							TopicModel.relateExistingNodesAsPivots(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
													userTopic.getLocator(), icons.RELATION_ICON,
													icons.RELATION_ICON, isPrivate, credentials, function portalMRelateNodes1(err, data) {
								if (err) {error+=err;}
		                        return callback(error, article.getLocator());
							}); //r1
		                }); //putnode 		  
					}    	
				});
			} else {
				return callback(error, userTopic);
			}
	    });
	};
	
	/**
	 * Update an existing node; no tags included
	 * This only works on nodes which are AIRs (tags and users are not AIR nodes)
     * @param json the node itself
     * @param user the JSON user object from Request
     * @param callback signature (err, data) can return undefined data
	 */
	self.update = function(json, user, callback) {
		myEnvironment.logDebug("PortalNodeModel.update "+JSON.stringify(json));
		var credentials = user.credentials,
			lox = json.locator,
			retval,
			error = "";
		DataProvider.getNodeByLocator(lox, credentials, function portalMGetNode1(err, result) {
			myEnvironment.logDebug("PortalNodeModel.update-1 "+err+" | "+result);
			if (err) {error += err;}
			if (result) {
				var title = json.title,
					body = json.body,
					lang = json.language,
					comment = "an edit by "+user.handle;
				if (!lang) {lang = "en";}
				var isNotUpdateToBody = false,
					oldBody;
				if(result.getBody(lang)) {
					oldBody = result.getBody(lang).theText;
				}
				if (oldBody) {
					isNotUpdateToBody = (oldBody === body);
				}
				myEnvironment.logDebug("PortalNodeModel.update-1A "+isNotUpdateToBody+" "+oldBody+" | "+body);
				var oldLabel = result.getSubject(lang).theText,
					isNotUpdateToLabel = (title === oldLabel);
				if (!isNotUpdateToLabel) {
					//crucial update to label
					result.updateSubject(title,lang,user.handle,comment);
					if (!isNotUpdateToBody) {
						// update body if necessary
						result.updateBody(body,lang,user.handle,comment);
					}
					result.setLastEditDate(new Date());
					DataProvider.updateNodeLabel(result, oldLabel, title, credentials, function portalMUpdateNodeLabel(err, data) {
						if (err) {error += err;}
						console.log("PortalNodeModel.update "+error+" "+oldLabel+" "+title);
						return callback(error, data);
					});
				} else {
					if (!isNotUpdateToBody) {
						//just update body
						myEnvironment.logDebug("PortalNodeModel.update-2 "+body+" | "+result.toJSON());
						result.updateBody(body, lang,user.handle, comment);
						result.setLastEditDate(new Date());
						myEnvironment.logDebug("PortalNodeModel.update-3 "+body+" | "+result.toJSON());
						DataProvider.putNode(result, function portalMPutNode2(err, data) {
							if (err) {error += err;}
							return callback(error, data);
						});
					} else {
						var foo;
						return callback(error, retval);
					}
				}
			} else {
				return callback(error, retval);
			}
		});
	 };
	
};