/**
 * ConversationModel
 * For managing structured conversations, which could be blog posts
 * or actual IBIS trees
 */

var  types = require('../../node_modules/tqtopicmap/lib/types')
, icons = require('../../node_modules/tqtopicmap/lib/icons')
, properties = require('../../node_modules/tqtopicmap/lib/properties')
, tagmodel = require('../tag/tagmodel')
, uuid = require('../../core/util/uuidutil')
  , constants = require('../../core/constants');

var ConversationModel = module.exports = function(environment) {
	var myEnvironment = environment;
	var CommonModel = environment.getCommonModel();
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var DataProvider = topicMapEnvironment.getDataProvider();
	var TopicModel = topicMapEnvironment.getTopicModel();
	var TagModel = new tagmodel(environment);
	var queryDSL = topicMapEnvironment.getQueryDSL();
	//some constants
	var MAPTYPE = "1"
	, QUESTIONTYPE = "2"
	, ANSWERTYPE = "3"
	, PROTYPE = "4"
	, CONTYPE = "5"
	, DECISIONTYPE = "6"
	, CLAIMTYPE = "7"
	, REFERENCETYPE = "8"
	, CHALLENGETYPE = "9"
	, EVIDENCE = "10"; //uses literature-analysis icons

	var self = this;	
  
	  /**
	   * Update an existing conversation entry; no tags included
	   */
	  self.update = function(blog,user,callback) {
		  myEnvironment.logDebug("CONVERSATION.UPDATE "+JSON.stringify(blog));
		  var credentials = user.credentials;
		  var lox = blog.locator;
		  DataProvider.getNodeByLocator(lox, credentials, function(err,result) {
			  var error = '';
			  if (err) {error += err;}
			  var title = blog.title;
			  var body = blog.body;
	    	  var lang = blog.language;
			  var isNotUpdateToBody = true;
	    	  var lang = blog.language;
	    	  if (!lang) {lang = "en";}
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
		    		  console.log("ConversationModel.update "+error+" "+oldLabel+" "+title);
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
  ///////////////////////////////
  //TODO
  // We need a create for each node type
  // The root class is CONVERSATION_MAP_TYPE
  self.createHelpMap = function(blog,user,credentials,callback) {
	  self.createRootMap(blog,user, credentials, function(err,data) {
		  var lox = data.getLocator();
		  var name = data.getSubject(constants.ENGLISH).theText;
		  myEnvironment.addConversationToHelp("/conversation/"+lox, name);
		  callback(err,data);
	  });
  },
  
  self.createRootMap = function(blog,user, credentials, callback) {
	  //NOTE: if parentNodeLocator exists, this is not a new map, so we use create
	    var userLocator = user.handle; // It's supposed to be user.handle;
	    //first, fetch this user's topic
	    var userTopic;
	    DataProvider.getNodeByLocator(userLocator, credentials, function(err,result) {
	      userTopic = result;
	      console.log('ConversationModel.createRootMap1 '+userLocator+' | '+userTopic);
	      // create the blog post
	      console.log("FOO "+types.BLOG_TYPE);
	      //NOTE: we are creating an AIR, which uses subject&body, not label&details
	      //locator,typeLocator, label, description,
			//lang,  userLocator,  smallImagePath,
			//largeImagePath,  isPrivate, credentials
	      TopicModel.newInstanceNode(uuid.newUUID(), types.CONVERSATION_MAP_TYPE,
	      		"", "", constants.ENGLISH, userLocator,
	      		icons.MAP_SM, icons.MAP, false, credentials, function(err, article) {
	    	  var lang = blog.language;
	    	  if (!lang) {lang = "en";}
	    	  var subj = blog.title;
	    	  var body = blog.body;
	    	  article.setSubject(subj,lang,userLocator);
	    	  article.setBody(body,lang,userLocator);
	    //	  console.log('BlogModel.create-2 '+article.toJSON());
				myEnvironment.addRecentConversation(article.getLocator(),blog.title);
	    	     // now deal with tags
				var taglist = CommonModel.makeTagList(blog);
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

	                TopicModel.relateExistingNodes(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
	                		userTopic.getLocator(),
	                      		icons.RELATION_ICON, icons.RELATION_ICON, false, false, credentials, function(err,data) {
	                    if (err) {console.log('ARTICLES_CREATE-3d '+err);}
	                    //modified to return entire node
	                    callback(err,article);
	                 }); //r1
	              }); //putnode 		  
	        	}); // processtaglist
	          }  else {
	              DataProvider.putNode(article, function(err,data) {
		                console.log('ARTICLES_CREATE-3 '+err);	  
		                if (err) {console.log('ARTICLES_CREATE-3a '+err)}
		                console.log('ARTICLES_CREATE-3b '+userTopic);	  

		                TopicModel.relateExistingNodes(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
		                		userTopic.getLocator(),
		                      		icons.RELATION_ICON, icons.RELATION_ICON, false, false, credentials, function(err,data) {
		                    if (err) {console.log('ARTICLES_CREATE-3d '+err);}
		                    //modified to return entire node
		                    callback(err,article);
		                 }); //r1
		              }); //putnode 		
	          }   	
	      });
	    });
  },
  
  self.createOtherNode = function(blog,user, credentials, callback) {
	  console.log("ConversationModel.createOtherNode "+JSON.stringify(blog));
	  myEnvironment.logDebug("ConversationModel.createOtherNode- "+JSON.stringify(blog));
	  var typ = blog.nodefoo;
	  var parentLocator = blog.locator;
	  if (typ === MAPTYPE) {
		  self.createMap(blog,user,parentLocator,credentials,function(err,result) {
			  callback(err,result);
		  });
	  } else if (typ === QUESTIONTYPE) {
		  self.createIssue(blog,user,parentLocator,credentials,function(err,result) {
			  callback(err,result);
		  });
	  } else if (typ === ANSWERTYPE) {
		  self.createPosition(blog,user,parentLocator,credentials,function(err,result) {
			  callback(err,result);
		  });		  
	  } else if (typ === PROTYPE) {
		  self.createPro(blog,user,parentLocator,credentials,function(err,result) {
			  callback(err,result);
		  });
	  } else if (typ === CONTYPE) {
		  self.createCon(blog,user,parentLocator,credentials,function(err,result) {
			  callback(err,result);
		  });
	  } else {
		  //MONSTER ERROR
    	  topicMapEnvironment.logError("ConversationModel.createOtherNode bad type "+typ);
		  callback("ConversationModel.createOtherNode bad type: "+typ, null);
	  }
	  
},
  
  self.createMap = function(blog,user,parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.CONVERSATION_MAP_TYPE,parentNodeLocator,icons.MAP_SM, icons.MAP,credentials, function(err,result) {
		  callback(err,result);
	  } );
	  
  },

  self.createIssue = function(blog,user, parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.ISSUE_TYPE,parentNodeLocator,icons.ISSUE_SM, icons.ISSUE,credentials, function(err,result) {
		  callback(err,result);
	  } );
  },
  self.createPosition = function(blog,user, parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.POSITION_TYPE,parentNodeLocator,icons.POSITION_SM, icons.POSITION,credentials, function(err,result) {
		  callback(err,result);
	  } );
  },

  self.createPro = function(blog,user, parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.PRO_TYPE,parentNodeLocator,icons.PRO_SM, icons.PRO,credentials, function(err,result) {
		  callback(err,result);
	  } );
  },

  self.createCon = function(blog,user, parentNodeLocator, credentials, callback) {
	  self.create(blog,user,types.CON_TYPE,parentNodeLocator,icons.CON_SM, icons.CON,credentials, function(err,result) {
		  callback(err,result);
	  } );
  },

  
  /**
   * Create a new conversation node
   * @param blog: a JSON object with appropriate values set
   * @param user: a JSON object of the user from the session
   * @param nodeType: maptype, protype, etc
   * @param parentNodeLocator: can be <code>null</code>
   * @param credentials
   * @param callback: signature (err, result): result = _id of new object
   */
  self.create = function (blog, user, nodeType, parentNodeLocator,
		  smallIcon, largeIcon, credentials, callback) {
	  var credentials = user.credentials;
	  var language = constants.ENGLISH; //TODO
	  
	  var contextLocator = parentNodeLocator; // default
	  //we're gonna punt here; if nobody sent in a contextLocator, then
	  // parentNodeLocator will be context.
	  if(blog.contextLocator && blog.contextLocator.length > 1) {
		  contextLocator = blog.contextLocator;
	  }
	  
    var userLocator = user.handle;
	myEnvironment.logDebug("ConversationModel.create- "+parentNodeLocator+" "+nodeType);
	myEnvironment.logDebug("ConversationModel.create-- "+JSON.stringify(blog));

    DataProvider.getNodeByLocator(parentNodeLocator, credentials, function(err,result) {
      var parent = result;
      //contextLocator, parentNode,
	  //newLocator, nodeType, subject, body, language, smallIcon, largeIcon,
	  //credentials, userLocator, isPrivate,
      TopicModel.createTreeNode(contextLocator,parent,"",nodeType,
    		  blog.title, blog.body, language, smallIcon, largeIcon,
    		  credentials, userLocator, false, function(err,data) {
    	  //data is the created node
    	  myEnvironment.logDebug("ConversationModel.create "+parentNodeLocator+" "+data.toJSON());
    	  myEnvironment.addRecentConversation(data.getLocator(),blog.title);
    	  var article = data;
	    DataProvider.getNodeByLocator(userLocator, credentials, function(err,result) {
	      var userTopic = result;
			
   	     	// now deal with tags
			var taglist = CommonModel.makeTagList(blog);
			console.log("NEW_POST "+err+" "+userTopic+" "+taglist);
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

               TopicModel.relateExistingNodes(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
               		userTopic.getLocator(),
                     		icons.RELATION_ICON, icons.RELATION_ICON, false, false, credentials, function(err,data) {
                   if (err) {console.log('ARTICLES_CREATE-3d '+err);}
                   //modified to return entire node
                   callback(err,article);
                }); //r1
             }); //putnode 		  
       		}); // processtaglist
	          }  else {
	              DataProvider.putNode(article, function(err,data) {
		                console.log('ARTICLES_CREATE-3 '+err);	  
		                if (err) {console.log('ARTICLES_CREATE-3a '+err)}
		                console.log('ARTICLES_CREATE-3b '+userTopic);	  

		                TopicModel.relateExistingNodes(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
		                		userTopic.getLocator(),
		                      		icons.RELATION_ICON, icons.RELATION_ICON, false, false, credentials, function(err,data) {
		                    if (err) {console.log('ARTICLES_CREATE-3d '+err);}
		                    //modified to return entire node
		                    callback(err,article);
		                 }); //r1
		              }); //putnode 		
	          }   	
	    });
      });
    });
  },
  
  self.performTransclude = function(body, credentials, isEvidence, callback) {
	  myEnvironment.logDebug("ConversationModel.performTransclude- "+isEvidence+" "+ JSON.stringify(body));
	  var fromNode = body.transcludeLocator;
	  var toNode = body.myLocator;
	  var contextLocator = body.contextLocator;
	  myEnvironment.logDebug("ConversationModel.performTransclude "+fromNode+" | "+toNode+" | "+contextLocator);
	  DataProvider.getNodeByLocator(fromNode, credentials, function(err,from) {
		  var error = '';
		  if (err) {error+=err;}
		  var sourceNode = from;
		  DataProvider.getNodeByLocator(toNode, credentials, function(err,to) {
			  if (err) {error+=err;}
			  var targetNode = to;
			  // add parent to source
			  var title = targetNode.getLabel(constants.ENGLISH);
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
			  targetNode.addChildNode(contextLocator,sourceNode.getSmallImage(),sourceNode.getLocator(),title);
			  if (isEvidence === "T") {
				  //perform surgery on that childnode
				  var l = targetNode.listChildNodes(contextLocator);
				  var len = l.length;
				  var x;
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
			  myEnvironment.logDebug("ConversationModel.performTransclude-2 "+targetNode.toJSON());
			  //TODO save them both
			  DataProvider.putNode(sourceNode, function(err,data) {
				  if (err) {error+=err;}
				  DataProvider.putNode(targetNode, function(err,data) {
					  if (err) {error+=err;}
					  callback(error,null);
				  });
				  
			  });
			  
		  });
		  
	  });
  },

  self.listConversations = function(start, count, credentials, callback) {
	  DataProvider.listInstanceNodes(types.CONVERSATION_MAP_TYPE, start,count,credentials, function(err,data,total) {
    //var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.CONVERSATION_MAP_TYPE);
    //DataProvider.listNodesByQuery(query, start,count,credentials, function(err,data,total) {
      console.log("ConversationModel.listConversations "+err+" "+data);
      callback(err,data,total);
    });
  },
  
  /**
   * @param credentials
   * @param callback signatur (data)
   */
  self.fillDatatable = function(start, count, credentials, callback) {
	  self.listConversations(start,count,credentials,function(err,result,totalx) {
	      console.log('ROUTES/conversation '+err+' '+result);
	      CommonModel.fillSubjectAuthorDateTable(result,"/conversation/",totalx, function(html,len,total) {
		      console.log("FILLING "+start+" "+count+" "+total);
		      callback(html,len,total);
	    	  
	      });
	  });
  }
  

};
