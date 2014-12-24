/**
 * ConversationModel
 * For managing structured conversations, which could be blog posts
 * or actual IBIS trees
 */
'use strict';
var  types = require('tqtopicmap/lib/types'),
    icons = require('tqtopicmap/lib/icons'),
    properties = require('tqtopicmap/lib/properties'),
    Tagmodel = require('../tag/tagmodel'),
    uuid = require('../../core/util/uuidutil'),
    conversationConstants = require('./conversationconstants'),
    Portalmodel = require('../common/portalnodemodel'),
    constants = require('../../core/constants');

var ConversationModel = module.exports = function(environment) {
	var myEnvironment = environment,
        CommonModel = environment.getCommonModel(),
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        DataProvider = topicMapEnvironment.getDataProvider(),
        TopicModel = topicMapEnvironment.getTopicModel(),
        TagModel = new Tagmodel(environment),
        queryDSL = topicMapEnvironment.getQueryDSL(),
        PortalNodeModel = new Portalmodel(environment, topicMapEnvironment, CommonModel),

        self = this;
	/**
	 * Update an existing node; no tags included
	 */
	self.update = function(json, user, credentials, callback) {
		PortalNodeModel.update(json, user, function(err, result) {
			return callback(err, null);
		});
	};


	///////////////////////////////
	//TODO
	// We need a create for each node type
	// The root class is CONVERSATION_MAP_TYPE
	self.createHelpMap = function(blog, user, credentials, callback) {
		self.createRootMap(blog,user, credentials, function(err, data) {
			var lox = data.getLocator(),
				name = data.getSubject(constants.ENGLISH).theText; //TODO
			myEnvironment.addConversationToHelp("/conversation/"+lox, name);
			return callback(err, data);
		});
	};
  
	self.createRootMap = function(blog, user, credentials, callback) {
		//NOTE: if parentNodeLocator exists, this is not a new map, so we use create
		var userLocator = user.handle, // It's supposed to be user.handle;
	    	//first, fetch this user's topic
			userTopic,
			error = "";
		DataProvider.getNodeByLocator(userLocator, credentials, function(err, result) {
			if (err) {error += err;}
			userTopic = result;
			console.log('ConversationModel.createRootMap1 '+userLocator+' | '+userTopic);
			// create the blog post
			console.log("FOO "+types.BLOG_TYPE);
			//NOTE: we are creating an AIR, which uses subject&body, not label&details
			//locator,typeLocator, label, description,
			//lang,  userLocator,  smallImagePath,
			//largeImagePath,  isPrivate, credentials
			TopicModel.newInstanceNode(uuid.newUUID(), types.CONVERSATION_MAP_TYPE,
								"", "", constants.ENGLISH, userLocator, icons.MAP_SM, icons.MAP,
								false, credentials, function(err, article) {
				if (err) {error += err;}
				var lang = blog.language;
				if (!lang) {lang = "en";}
				var subj = blog.title,
					body = blog.body;
				article.setSubject(subj,lang,userLocator);
				article.setBody(body.trim(),lang,userLocator);
	    //	  console.log('BlogModel.create-2 '+article.toJSON());
				myEnvironment.addRecentConversation(article.getLocator(),blog.title);
	    	     // now deal with tags
				var taglist = CommonModel.makeTagList(blog);
				if (taglist.length > 0) {
					TagModel.processTagList(taglist, userTopic, article, credentials, function(err, result) {
						if (err) {error += err;}
						console.log('NEW_POST-1 '+result);
						//result could be an empty list;
						//TagModel already added Tag_Doc and Doc_Tag relations
						console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
						DataProvider.putNode(article, function(err, data) {
							console.log('ARTICLES_CREATE-3 '+err);	  
							if (err) {error += err;}
							console.log('ARTICLES_CREATE-3b '+userTopic);	  
							TopicModel.relateExistingNodesAsPivots(userTopic, article, types.CREATOR_DOCUMENT_RELATION_TYPE,
												userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
												false, credentials, function(err, data) {
								if (err) {error += err;}
								//modified to return entire node
								return callback(error, article);
							}); //r1
						}); //putnode 		  
					}); // processtaglist
				} else {
					DataProvider.putNode(article, function(err, data) {
						console.log('ARTICLES_CREATE-3 '+err);	  
						if (err) {error += err;}
						console.log('ARTICLES_CREATE-3b '+userTopic);	  
						TopicModel.relateExistingNodesAsPivots(userTopic, article, types.CREATOR_DOCUMENT_RELATION_TYPE,
											userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
											false, credentials, function(err, data) {
		                    if (err) {error += err;}
		                    //modified to return entire node
							return callback(error, article);
						}); //r1
					}); //putnode 		
				}   	
			});
		});
	};
  
	self.createOtherNode = function(blog, user, credentials, callback) {
		//console.log("ConversationModel.createOtherNode "+JSON.stringify(blog));
		myEnvironment.logDebug("ConversationModel.createOtherNode- "+JSON.stringify(blog));
		var typ = blog.nodefoo,
			parentLocator = blog.locator;
		if (typ === conversationConstants.MAPTYPE) {
			self.createMap(blog, user, parentLocator, credentials, function(err, result) {
				return callback(err, result);
			});
		} else if (typ === conversationConstants.QUESTIONTYPE) {
			self.createIssue(blog, user, parentLocator, credentials, function(err, result) {
			  return callback(err, result);
			});
		} else if (typ === conversationConstants.ANSWERTYPE) {
			self.createPosition(blog, user, parentLocator, credentials, function(err, result) {
				return callback(err, result);
			});		  
		} else if (typ === conversationConstants.PROTYPE) {
			self.createPro(blog, user, parentLocator, credentials, function(err, result) {
				return callback(err, result);
			});
		} else if (typ === conversationConstants.CONTYPE) {
			self.createCon(blog, user, parentLocator, credentials, function(err, result) {
				return callback(err, result);
			});
		} else {
			//MONSTER ERROR
			myEnvironment.logError("ConversationModel.createOtherNode bad type "+typ);
			return callback("ConversationModel.createOtherNode bad type: "+typ, null);
		}
	  
	};
  
	self.createMap = function(blog, user, parentNodeLocator, credentials, callback) {
		self.create(blog, user, types.CONVERSATION_MAP_TYPE, parentNodeLocator, icons.MAP_SM, icons.MAP, credentials, function(err, result) {
			return callback(err, result);
		});
	};

	self.createIssue = function(blog, user, parentNodeLocator, credentials, callback) {
		//myEnvironment.logDebug("ConversationModel.createIssue "+parentNodeLocator);
		self.create(blog, user, types.ISSUE_TYPE, parentNodeLocator, icons.ISSUE_SM, icons.ISSUE, credentials, function(err, result) {
			//myEnvironment.logDebug("ConversationModel.createIssue-1 "+err+" | "+result);
			return callback(err, result);
		});
	};
    
	self.createPosition = function(blog, user, parentNodeLocator, credentials, callback) {
		self.create(blog, user, types.POSITION_TYPE, parentNodeLocator, icons.POSITION_SM, icons.POSITION, credentials, function(err, result) {
			return callback(err, result);
		});
	};

	self.createPro = function(blog, user, parentNodeLocator, credentials, callback) {
		self.create(blog, user, types.PRO_TYPE, parentNodeLocator, icons.PRO_SM, icons.PRO,credentials, function(err, result) {
			return callback(err, result);
		});
	};

	self.createCon = function(blog, user, parentNodeLocator, credentials, callback) {
		self.create(blog,user,types.CON_TYPE, parentNodeLocator, icons.CON_SM, icons.CON, credentials, function(err, result) {
			return callback(err, result);
		});
	};

  
	/**
	 * Create a new conversation node
	 * @param blog: a JSON object with appropriate values set
	 * @param user: a JSON object of the user from the session
	 * @param nodeType: maptype, protype, etc
	 * @param parentNodeLocator: can be <code>null</code>
	 * @param credentials
	 * @param callback: signature (err, result): result = the entire new object
	 */
	self.create = function (blog, user, nodeType, parentNodeLocator,
							smallIcon, largeIcon, credentials, callback) {
		var credentials = user.credentials,
			language = constants.ENGLISH, //TODO
			contextLocator = parentNodeLocator; // default
		myEnvironment.logDebug("ConversationModel.create "+parentNodeLocator);
		//we're gonna punt here; if nobody sent in a contextLocator, then
		// parentNodeLocator will be context.
		//TODO
		// The following contextlocator test will not allow us to create GAME TREE nodes in quiests
		//   that's because child nodes in a quest come in with context associated with the quest
		// THIS
		// WHY IS THIS HERE?
		// FOR NOW: going to comment out the return; not sure why it is there
      
		if(blog.contextLocator && blog.contextLocator.length > 1) {
			contextLocator = blog.contextLocator;
		}
		var userLocator = user.handle,
			parent = null,
			error = "",
			lox = DataProvider.uuid(),
			article, userTopic, taglist = CommonModel.makeTagList(blog);
		myEnvironment.logDebug("ConversationModel.create- "+parentNodeLocator+" "+nodeType);
		myEnvironment.logDebug("ConversationModel.create-- "+JSON.stringify(blog));
		if (parentNodeLocator && parentNodeLocator != null && parentNodeLocator.length > 0) {
			DataProvider.getNodeByLocator(parentNodeLocator, credentials, function(err, result) {
				if (err) {error += err;}
				parent = result;
				TopicModel.createTreeNode(contextLocator, parent, lox, nodeType,
										blog.title, blog.body, language, smallIcon, largeIcon,
										credentials, userLocator, false, function(err, data) {
					if (err) {error += err;}
					//data is the created node
					myEnvironment.logDebug("ConversationModel.create-1 "+parentNodeLocator+" "+data.toJSON());
					myEnvironment.addRecentConversation(data.getLocator(),blog.title);
					article = data;
					DataProvider.getNodeByLocator(userLocator, credentials, function(err, result) {
						userTopic = result;
						if (err) {error += err;}
						// now deal with tags
						console.log("NEW_POST "+err+" "+userTopic+" "+taglist);
						if (taglist.length > 0) {
							TagModel.processTagList(taglist, userTopic, article, credentials, function(err, result) {
								if (err) {error += err;}
								console.log('NEW_POST-1 '+result);
								//result could be an empty list;
								//TagModel already added Tag_Doc and Doc_Tag relations
								console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
								DataProvider.putNode(article, function(err, data) {
									console.log('ARTICLES_CREATE-3 '+err);	  
									if (err) {error += err;}
									console.log('ARTICLES_CREATE-3b '+userTopic);	  
									TopicModel.relateExistingNodesAsPivots(userTopic, article, types.CREATOR_DOCUMENT_RELATION_TYPE,
														userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
														false, credentials, function(err, data) {
										if (err) {error += err;}
										//modified to return entire node
										return callback(error, article);
									}); //r1
								}); //putnode 		  
							}); // processtaglist
						}  else {
							DataProvider.putNode(article, function(err, data) {
								console.log('ARTICLES_CREATE-3 '+err);	  
								if (err) {error += err;}
								console.log('ARTICLES_CREATE-3b '+userTopic);	  
								TopicModel.relateExistingNodesAsPivots(userTopic, article, types.CREATOR_DOCUMENT_RELATION_TYPE,
													userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
													false, credentials, function(err, data) {
									if (err) {error += err;}
									//modified to return entire node
									return  callback(error, article);
								}); //r1
							}); //putnode 		
						}   	
					}); // getnode
				}); // create treenode
			}); // getnode
		} else {
			//no parent node
			myEnvironment.logDebug("ConversationModel.create---2 "+parent+" "+lox);
			//contextLocator, parentNode,
			//newLocator, nodeType, subject, body, language, smallIcon, largeIcon,
			//credentials, userLocator, isPrivate,
			TopicModel.createTreeNode(contextLocator, parent, lox, nodeType,
								blog.title, blog.body, language, smallIcon, largeIcon,
								credentials, userLocator, false, function(err, data) {
				if (err) {error += err;}
				//data is the created node
				myEnvironment.logDebug("ConversationModel.create-2 "+parentNodeLocator+" "+data.toJSON());
				myEnvironment.addRecentConversation(data.getLocator(),blog.title);
				article = data;
				DataProvider.getNodeByLocator(userLocator, credentials, function(err, result) {
					if (err) {error += err;}
					userTopic = result;
					// now deal with tags
					console.log("NEW_POST "+err+" "+userTopic+" "+taglist);
					if (taglist.length > 0) {
						TagModel.processTagList(taglist, userTopic, article, credentials, function(err, result) {
							console.log('NEW_POST-1 '+result);
							if (err) {error += err;}
							 //result could be an empty list;
							//TagModel already added Tag_Doc and Doc_Tag relations
							console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
							DataProvider.putNode(article, function(err, data) {
								console.log('ARTICLES_CREATE-3 '+err);	  
								if (err) {error += err;}
								console.log('ARTICLES_CREATE-3b '+userTopic);	  
								TopicModel.relateExistingNodesAsPivots(userTopic, article, types.CREATOR_DOCUMENT_RELATION_TYPE,
														userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
														false, credentials, function(err, data) {
									if (err) {error += err;}
									//modified to return entire node
									return callback(error, article);
								}); //r1
							}); //putnode 		  
						}); // processtaglist
					}  else {
						DataProvider.putNode(article, function(err, data) {
							console.log('ARTICLES_CREATE-3 '+err);	  
							if (err) {error += err;}
							console.log('ARTICLES_CREATE-3b '+userTopic);	  
							TopicModel.relateExistingNodesAsPivots(userTopic,article, types.CREATOR_DOCUMENT_RELATION_TYPE,
														userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
														false, credentials, function(err, data) {
								if (err) {error += err;}
								//modified to return entire node
								return  callback(error, article);
							}); //r1
						}); //putnode 		
					}   	
				});
			});
		}
	};
  
	/**
 	 * 
 	 */
	self.performTransclude = function(body, user, isEvidence, callback) {
		myEnvironment.logDebug("ConversationModel.performTransclude- "+isEvidence+" "+ JSON.stringify(body));
		var fromNode = body.transcludeLocator,
			toNode = body.myLocator,
			credentials = user.credentials,
			contextLocator = body.contextLocator,
			error = "",
			userLocator = user.handle;
		myEnvironment.logDebug("ConversationModel.performTransclude "+fromNode+" | "+toNode+" | "+contextLocator);
		DataProvider.getNodeByLocator(userLocator, credentials, function(err, result) {
			if (err) {error+=err;}
			var userTopic = result;
 			DataProvider.getNodeByLocator(fromNode, credentials, function(err,from) {
				if (err) {error+=err;}
				var sourceNode = from;
				DataProvider.getNodeByLocator(toNode, credentials, function(err,to) {
					if (err) {error+=err;}
					var targetNode = to,
						// add parent to source
						title = targetNode.getLabel(constants.ENGLISH); //TODO
					if (!title) {
						title = targetNode.getSubject(constants.ENGLISH).theText;
					}
					sourceNode.addParentNode(contextLocator, targetNode.getSmallImage(), targetNode.getLocator(), title);
					myEnvironment.logDebug("ConversationModel.performTransclude-1 "+sourceNode.toJSON());
					// add child to target
					title = sourceNode.getLabel(constants.ENGLISH);
					if (!title) {
						title = sourceNode.getSubject(constants.ENGLISH).theText;
					}
					//this adds transcluderLocator to the child representation
					//we use it in the user interface
					targetNode.addChildNode(contextLocator, sourceNode.getSmallImage(), sourceNode.getLocator(), title, userLocator);
					if (isEvidence === "T") {
						//perform surgery on that childnode
						var l = targetNode.listChildNodes(contextLocator),
							len = l.length,
							x;
						//find it
						for(var i=0;i<len;i++) {
							x = l[i];
							if (x.locator === sourceNode.getLocator()) {
								//set a flag
								x.isevidence="T";
								break;
							}
						}
					}
					TopicModel.relateExistingNodesAsPivots(sourceNode, userTopic, types.DOCUMENT_TRANSCLUDER_RELATION_TYPE,
											userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
											false, credentials, function(err, data) {
						myEnvironment.logDebug("ConversationModel.performTransclude-2 "+targetNode.toJSON());
						if (err) {error+=err;}
						// save them 
						DataProvider.putNode(sourceNode, function(err, data) {
 							if (err) {error+=err;}
							 DataProvider.putNode(targetNode, function(err,data) {
								if (err) {error+=err;}
								DataProvider.putNode(userTopic, function(err,data) {
									if (err) {error+=err;}
									return callback(error,null);
								});
							});
						});
					});
				});
			});
		});
	};

	self.listConversations = function(start, count, credentials, callback) {
		DataProvider.listInstanceNodes(types.CONVERSATION_MAP_TYPE, start, count, credentials, function(err, data, total) {
			//var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.CONVERSATION_MAP_TYPE);
			//DataProvider.listNodesByQuery(query, start,count,credentials, function(err,data,total) {
			console.log("ConversationModel.listConversations "+err+" "+data);
			return callback(err, data, total);
		});
	};
  
	/**
	 * @param credentials
	 * @param callback signatur (data)
	 */
	self.fillDatatable = function(start, count, credentials, callback) {
		self.listConversations(start,count,credentials,function(err, result, totalx) {
			console.log('ROUTES/conversation '+err+' '+result);
			CommonModel.fillSubjectAuthorDateTable(result,"/conversation/", totalx, function(html, len, total) {
				console.log("FILLING "+start+" "+count+" "+total);
				return callback(html, len, total);  
			});
		});
	};

};
