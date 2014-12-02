/**
 * QuestModel
 */
var types = require('../../node_modules/tqtopicmap/lib/types'),
    icons = require('../../node_modules/tqtopicmap/lib/icons'),
    properties = require('../../node_modules/tqtopicmap/lib/properties'),
    Gameenv = require('../rpg/rpgenvironment'),
    gameConstants = require('../rpg/gameconstants'),
    constants = require('../../core/constants'),
    uuid = require('../../core/util/uuidutil'),
    Tagmodel = require('../tag/tagmodel'),
    extendedtypes = require("../../core/extendedtypology"),
    Conmodel = require('../conversation/conversationmodel')
;

var IssueModel =  module.exports = function(environment) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        DataProvider = topicMapEnvironment.getDataProvider(),
        TopicModel = topicMapEnvironment.getTopicModel(),
        TagModel = new Tagmodel(environment),
        CommonModel = environment.getCommonModel(),
        queryDSL = topicMapEnvironment.getQueryDSL(),
        RPGEnvironment = environment.getRPGEnvironment(),
	    ConversationModel = new Conmodel(environment),
        self = this;
	
	self.getRPGEnvironment = function() {
		return RPGEnvironment;
	}
	
	
	  /**
	   * Update an existing blog entry; no tags included
	   */
	  self.update = function(blog, user, credentials, callback) {
          myEnvironment.logDebug("Quest.UPDATE "+JSON.stringify(blog));
		  var lox = blog.locator;
		  DataProvider.getNodeByLocator(lox, credentials, function(err, result) {
			  var error = '';
			  if (err) {error += err;}
			  var title = blog.title,
                  body = blog.body,
                  lang = blog.language,
                  comment = "an edit by "+user.handle;
              if (!lang) {lang = "en";}
			  var isNotUpdateToBody = true,
                  oldBody;
              if (result.getBody(lang)) {
                  oldBody = result.getBody(lang).theText;
              }
              if (oldBody) {
                  isNotUpdateToBody = (oldBody === body);
              }
	    	  var oldLabel = result.getSubject(lang).theText,
                  isNotUpdateToLabel = (title === oldLabel);
	    	  if (!isNotUpdateToLabel) {
	    		  //crucial update to label
	    		  result.updateSubject(title,lang,user.handle,comment);
	    		  if (!isNotUpdateToBody) {
	    			  result.updateBody(body,lang,user.handle,comment);
	    		  }
		    	  result.setLastEditDate(new Date());
		    	  DataProvider.updateNodeLabel(result, oldLabel, title, credentials, function(err,data) {
		    		  if (err) {error += err;}
		    		  console.log("IssueModel.update "+error+" "+oldLabel+" "+title);
		    		  return callback(error,data);
		    	  });
	    	  } else {
	    		  if (!isNotUpdateToBody) {
	    			  result.updateBody(body,lang,user.handle,comment);
	    			  result.setLastEditDate(new Date());
			    	  DataProvider.putNode(result, function(err,data) {
			    		  if (err) {error += err;}
			    		  return callback(error,data);
			    	  });
	    		  } else {
	    			  return callback(error,null);
	    		  }
	    	  };
		  });
	  },
	  
	  /**
	   * Create a new blog post
	   * @param blog: a JSON object with appropriate values set
	   * @param user: a JSON object of the user from the session
	   * @param credentials
	   * @param callback: signature (err, result): result = _id of new object
	   */
	  self.create = function (blog, user, credentials, callback) {
		  console.log('BMXXXX '+JSON.stringify(blog));
		// some really wierd shit: the User object for the user database stores
		// as user.handle, but passport seems to muck around and return user.username
	    var userLocator = user.handle; // It's supposed to be user.handle;
	    //first, fetch this user's topic
	    var userTopic,
            theQuest,
            error = "",
            issueloc = blog.parent;
          myEnvironment.logDebug("QuestModel.create-1 "+issueloc+" | "+JSON.stringify(blog));
	    DataProvider.getNodeByLocator(userLocator, credentials, function(err,result) {
            if (err) {error += err}
	      userTopic = result;
	      console.log('QuestModel.create-1 '+userLocator+' | '+userTopic);
	      // create the blog post
	      console.log("FOO "+types.QUEST_TYPE);
            //FIRST, CREATE the Landing Page
	      //NOTE: we are creating an AIR, which uses subject&body, not label&details
	      TopicModel.newInstanceNode(uuid.newUUID(), types.QUEST_TYPE,
                                     "", "", constants.ENGLISH, userLocator,
                                     icons.CHALLENGE_SM, icons.CHALLENGE, false, credentials, function(err, article) {
              if (err) {error += err}
              theQuest = article;
	    	  var lang = blog.language;
	    	  if (!lang) {lang = "en";}
	    	  var subj = blog.title;
	    	  var body = blog.body;
	    	  theQuest.setSubject(subj,lang,userLocator);
	    	  theQuest.setBody(body.trim(),lang,userLocator);
	    //	  console.log('BlogModel.create-2 '+article.toJSON());
	    	  RPGEnvironment.addRecentQuest(article.getLocator(),blog.title);
              myEnvironment.logDebug("QuestModel.create-2 "+error);
              //Now, add issuepivot
              //TODO add userpivot
              DataProvider.getNodeByLocator(issueloc, credentials, function(err,issuenode) {
                  if (err) {error += err}
                  console.log("FIDDLE "+err+" | "+issuenode);
                  myEnvironment.logDebug("QuestModel.create-2A "+err+" "+issuenode);
                  TopicModel.relateExistingNodesAsPivots(issuenode,theQuest,extendedtypes.ISSUE_QUEST_RELATION_TYPE,
                                                         userTopic.getLocator(),
                                                         icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function(err,data) {
                      if (err) {error += err}
                      //NOW, create the Question
                      var bx = {};
                      bx.title = blog.question;
                      bx.body = blog.questionbody;
                      bx.language = blog.language;
                      if (blog.tag1) {
                          bx.tag1 = blog.tag1;
                      }
                      if (blog.tag2) {
                          bx.tag2 = blog.tag2;
                      }
                      if (blog.tag3) {
                          bx.tag3 = blog.tag3;
                      }
                      if (blog.tag4) {
                          bx.tag4 = blog.tag4;
                      }
                      myEnvironment.logDebug("QuestModel.create-2B ");
                      //NoW create the quest's root node
                      ConversationModel.createIssue(bx, user, theQuest.getLocator(), credentials, function(err, qnode) {
                          if (err) {error += err}
                          //Tell the quest it has a tree root locator
                          theQuest.setProperty(gameConstants.QUEST_ROOT_NODE_PROPERTY, qnode.getLocator());
                          // now deal with tags
                          myEnvironment.logDebug("QuestModel.create-3 "+error+" "+theQuest.toJSON());
                          var taglist = CommonModel.makeTagList(blog);
                          if (taglist.length > 0) {
                              TagModel.processTagList(taglist, userTopic, theQuest, credentials, function(err,result) {
                                  console.log('NEW_POST-1 '+result);
                                  if (err) {error += err}
                                  //result could be an empty list;
                                  //TagModel already added Tag_Doc and Doc_Tag relations
                                  console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
//                                  DataProvider.putNode(theQuest, function(err,data) {
//                                      console.log('ARTICLES_CREATE-3 '+err);	  
//                                      if (err) {error += err}
//                                      console.log('ARTICLES_CREATE-3b '+userTopic);	  

                                  TopicModel.relateExistingNodesAsPivots(userTopic,theQuest,types.CREATOR_DOCUMENT_RELATION_TYPE,
                                                                         userTopic.getLocator(),
                                                                         icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function(err,data) {
                                      if (err) {error += err}
                                      return callback(error,theQuest.getLocator());
                                  }); //r1
 //                             }); //putnode 		  
                              }); // processtaglist
                          }  else {
//                          DataProvider.putNode(theQuest, function(err,data) {
//                              console.log('ARTICLES_CREATE-3 '+err);	  
//                              if (err) {error += err}
//                              console.log('ARTICLES_CREATE-3b '+userTopic);	  

                              TopicModel.relateExistingNodesAsPivots(userTopic,theQuest,types.CREATOR_DOCUMENT_RELATION_TYPE,
                                                                     userTopic.getLocator(),
                                                                     icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function(err,data) {
                                  if (err) {error += err}
                                  return callback(error,theQuest.getLocator());
                              }); //r1
//                          }); //putnode 		  
                          }                          
                      });

                  });
              });
	      });
	    });
	  },
	  
	  self.listQuests = function(start, count, credentials, callback) {
       DataProvider.listInstanceNodes(types.QUEST_TYPE, start,count,credentials, function(err,data,total){
 	      console.log("QuestModel.listIssues "+err+" "+data);
	      return callback(err,data, total);
	    });
	  },
	  
	  /**
	   * @param start
	   * @param count
	   * @param credentials
	   * @param callback signatur (data, countsent, totalavailable)
	   */
	  self.fillDatatable = function(start, count,credentials, callback) {
		  self.listQuests(start,count,credentials,function(err,result, totalx) {
		      console.log('QuestModel.fillDatatable '+err+' '+totalx+" "+result);
		      CommonModel.fillSubjectAuthorDateTable(result,"/quest/",totalx, function(html,len,total) {
			      console.log("FILLING "+start+" "+count+" "+total);
			      return callback(html,len,total);
		    	  
		      });
		  });
	  }
	  
          /**
           * Add <code>guildLocator</code> to <code>questNode</code> and save it
           * @param questNode
           * @param guildLocator
           * @param callback signature ( err, data )
           */
      self.addGuild = function(questNode, guildLocator, callback) {
          questNode.addSetValue(gameConstants.QUEST_GUILD_LIST_PROPERTY, guildLocator);
          questNode.putNode(questNode, function(err, data) {
              callback(err, data);
          });
      },
      
          /**
           * Remove <code>guildLocator</code> from <code>guildNode</code> and save it
           * @param questNode
           * @param userLocator
           * @param callback signature (err,data)
           */
      self.removeGuild = function(questNode, guildLocator, callback) {
          questNode.removeCollectionValue(gameConstants.QUEST_GUILD_LIST_PROPERTY, guildLocator);
          DataProvider.putNode(questNode, function(err, data) {
              callback(err, data);
          });
      },
          
          /**
           * Return a list of guild playing this quest
           * @param questNode
           * @return list or undefined
           */
      self.listLeaders = function(questNode) {
          return questNode.getProperty(gameConstants.QUEST_GUILD_LIST_PROPERTY);
      },

      /**
       * Return this quest's gametree root node
       * @param questNode
       * @param credentials
       * @param callback signature (err,data)
       */
      self.getTreeRootNode = function(questNode, credentials, callback) {
          var rootLocator =  questNode.getProperty(gameConstants.QUEST_ROOT_NODE_PROPERTY);
          DataProvider.getNodeByLocator(rootLocator, credentials, function(err, data) {
            return callback(err, data);
          });
      }

}