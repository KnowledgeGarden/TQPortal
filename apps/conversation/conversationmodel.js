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
	var Dataprovider = topicMapEnvironment.getDataProvider();
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
  
  ///////////////////////////////
  //TODO
  // We need a create for each node type
  // The root class is CONVERSATION_MAP_TYPE
  
  self.createRootMap = function(blog,user, credentials, callback) {
	  //NOTE: if parentNodeLocator exists, this is not a new map, so we use create
	    var userLocator = user.handle; // It's supposed to be user.handle;
	    //first, fetch this user's topic
	    var userTopic;
	    Dataprovider.getNodeByLocator(userLocator, credentials, function(err,result) {
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
	          var tags = blog.tags;
	          if (tags.length > 0 && tags.indexOf(',') > -1) {
	            var tagList = tags.split(',');
	            TagModel.processTagList(tagList, userTopic, article, credentials, function(err,result) {
	              console.log('NEW_POST-1 '+result);
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
	                      callback(err,article.getLocator());
	                 }); //r1
	              }); //putnode 		  
	        	}); // processtaglist
	          } else {
	            TagModel.processTag(tags, userTopic, article, credentials, function(err,result) {
	              console.log('NEW_POST-2 '+result);
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
  
  self.createOtherNode = function(blog,user, credentials, callback) {
	  console.log("ConversationModel.createOtherNode "+JSON.stringify(blog));
	  topicMapEnvironment.logDebug("ConversationModel.createOtherNode- "+JSON.stringify(blog));
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
	  var contextLocator = blog.contextLocator;
	  //TODO
	  //ISSUE:  "contextLocator":"\"\"\"e7a6f620-181b-11e4-8f8d-19fadb5e55fe\"\"\"\"\"\""
    var userLocator = user.handle;
	topicMapEnvironment.logDebug("ConversationModel.create- "+parentNodeLocator+" "+nodeType);
	topicMapEnvironment.logDebug("ConversationModel.create-- "+JSON.stringify(blog));

    Dataprovider.getNodeByLocator(parentNodeLocator, credentials, function(err,result) {
      var parent = result;
      //contextLocator, parentNode,
	  //newLocator, nodeType, subject, body, language, smallIcon, largeIcon,
	  //credentials, userLocator, isPrivate,
      TopicModel.createTreeNode(contextLocator,parent,"",nodeType,
    		  blog.title, blog.body, language, smallIcon, largeIcon,
    		  credentials, userLocator, false, function(err,data) {
    	  //data is the created node
    	  topicMapEnvironment.logDebug("ConversationModel.create "+parentNodeLocator+" "+data.toJSON());
			myEnvironment.addRecentConversation(data.getLocator(),blog.title);
    	  //TODO tags
    	  
    	  callback(err,data);
      });
    });
  },
  
  self.performTransclude = function(body, credentials, callback) {
	  topicMapEnvironment.logDebug("ConversationModel.performTransclude- "+JSON.stringify(body));
	  var fromNode = body.transcludeLocator;
	  var toNode = body.myLocator;
	  var contextLocator = body.contextLocator;
	  topicMapEnvironment.logDebug("ConversationModel.performTransclude "+fromNode+" | "+toNode+" | "+contextLocator);
	  Dataprovider.getNodeByLocator(fromNode, credentials, function(err,from) {
		  var error = '';
		  if (err) {error+=err;}
		  var sourceNode = from;
		  Dataprovider.getNodeByLocator(toNode, credentials, function(err,to) {
			  if (err) {error+=err;}
			  var targetNode = to;
			  //TODO add parent to source
			  sourceNode.addParentNode(contextLocator, targetNode.getSmallImage(), targetNode.getLocator(), targetNode.getSubject(constants.ENGLISH).theText);
			  topicMapEnvironment.logDebug("ConversationModel.performTransclude-1 "+sourceNode.toJSON());
			  //TODO add child to target
			  targetNode.addChildNode(contextLocator,sourceNode.getSmallImage(),sourceNode.getLocator(),sourceNode.getSubject(constants.ENGLISH).theText);
			  topicMapEnvironment.logDebug("ConversationModel.performTransclude-2 "+targetNode.toJSON());
			  //TODO save them both
			  Dataprovider.putNode(sourceNode, function(err,data) {
				  if (err) {error+=err;}
				  Dataprovider.putNode(targetNode, function(err,data) {
					  if (err) {error+=err;}
					  callback(error,null);
				  });
				  
			  });
			  
		  });
		  
	  });
  }
  self.listConversations = function(start, count, credentials, callback) {
    var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.CONVERSATION_MAP_TYPE);
    Dataprovider.listNodesByQuery(query, start,count,credentials, function(err,data) {
      console.log("ConversationModel.listConversations "+err+" "+data);
      callback(err,data);
    });
  },
  
  /**
   * @param credentials
   * @param callback signatur (data)
   */
  self.fillDatatable = function(credentials, callback) {
	  self.listConversations(0,100,credentials,function(err,result) {
	      console.log('ROUTES/conversation '+err+' '+result);
	    	  CommonModel.fillDatatable(result, "conversation/", function(data) {
	    		  callback(data);
	    	  });
	  });
  }
  

};
