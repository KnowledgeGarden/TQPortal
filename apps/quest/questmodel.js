/**
 * QuestModel
 */
var types = require('tqtopicmap/lib/types'),
    icons = require('tqtopicmap/lib/icons'),
    properties = require('tqtopicmap/lib/properties'),
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
	};
	
	
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
    	  } else if (!isNotUpdateToBody) {
          result.updateBody(body,lang,user.handle,comment);
          result.setLastEditDate(new Date());
          DataProvider.putNode(result, function(err, data) {
            if (err) {error += err;}
            return callback(error, data);
          });
        } else {
          var foo;
          return callback(error, foo);
        }
	  });
  };
	  
  /**
   * Create a new Quest (Issue)
   * @param blog: a JSON object with appropriate values set
   * @param user: a JSON object of the user from the session
   * @param credentials
   * @param callback: signature (err, result): result = _id of new object
   */
  self.create = function (blog, user, credentials, callback) {
	  console.log('BMXXXX '+JSON.stringify(blog));
    var userLocator = user.handle,
        userTopic,
        error = "",
        issueloc = blog.parent,
        isPrivate = false;
    if (blog.isPrivate) {
      isPrivate = blog.isPrivate;
    }
    myEnvironment.logDebug("QuestModel.create-1 "+issueloc+" | "+JSON.stringify(blog));
    //get the user
    DataProvider.getNodeByLocator(userLocator, credentials, function(err, result) {
      if (err) {error += err}
      userTopic = result;
      console.log('QuestModel.create-1 '+userLocator+' | '+userTopic);
      var lang = blog.language;
      if (!lang) {lang = "en";}
      //get the quest topic
      DataProvider.getNodeByLocator(issueloc, credentials, function(err, issuenode) {
        if (err) {error += err}
        console.log("FIDDLE "+err+" | "+issuenode);
        myEnvironment.logDebug("QuestModel.create-2A "+err+" "+issuenode);
        //NOW, create the Question (Issue/Quest)
        var bx = {};
        bx.title = blog.question;
        bx.body = blog.questionbody.trim();
        //it's interesting that the JSON source of the resulting node will still have a long
        // empty string, even though we trim it here

        bx.language = lang;
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
        //NoW create the quest's Issue
        var parent; // there is no parent
        ConversationModel.createIssue(bx, user, parent, isPrivate, credentials, function(err, qnode) {
          if (err) {error += err}
          //Change the icons in qnode and save it
          qnode.setImage(icons.CHALLENGE);
          qnode.setSmallImage(icons.CHALLENGE_SM);
          qnode.setNodeType(types.QUEST_TYPE);
          RPGEnvironment.addRecentQuest(qnode.getLocator(), blog.title);
          myEnvironment.logDebug("QuestModel.create-2 "+error);
          TopicModel.relateExistingNodesAsPivots(issuenode, qnode, extendedtypes.ISSUE_QUEST_RELATION_TYPE,
                                userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
                                isPrivate, credentials, function(err, data) {
            if (err) {error += err}
            DataProvider.putNode(qnode, function(err, dx) {
              if (err) {error += err}
              // now deal with tags
              myEnvironment.logDebug("QuestModel.create-3 "+error+" "+qnode.toJSON());
              var taglist = CommonModel.makeTagList(blog);
              if (taglist.length > 0) {
                TagModel.processTagList(taglist, userTopic, qnode, credentials, function(err, result) {
                  console.log('NEW_POST-1 '+result);
                  if (err) {error += err}
                  //result could be an empty list;
                  //TagModel already added Tag_Doc and Doc_Tag relations
                  console.log("ARTICLES_CREATE_2 "+JSON.stringify(qnode));
                  TopicModel.relateExistingNodesAsPivots(userTopic, qnode, types.CREATOR_DOCUMENT_RELATION_TYPE,
                                                      userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
                                                      isPrivate, credentials, function(err, data) {
                    if (err) {error += err}
                    return callback(error, qnode.getLocator());
                  }); //r1
                }); // processtaglist
              } else {
                TopicModel.relateExistingNodesAsPivots(userTopic,qnode,types.CREATOR_DOCUMENT_RELATION_TYPE,
                                                    userTopic.getLocator(), icons.RELATION_ICON, icons.RELATION_ICON,
                                                    isPrivate, credentials, function(err, data) {
                  if (err) {error += err}
                  return callback(error, qnode.getLocator());
                }); //r1
              }
            }); //pur                         
          }); // relate
        }); // create
      }); // get issue
    }); // get user
  };
	  
  self.listQuests = function(start, count, credentials, callback) {
    DataProvider.listInstanceNodes(types.QUEST_TYPE, start,count,credentials, function(err,data,total){
      console.log("QuestModel.listIssues "+err+" "+data);
      return callback(err,data, total);
    });
  };
	  
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
  };
	  
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
  };
      
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
  };
          
  /**
   * Return a list of guild playing this quest
   * @param questNode
   * @return list or undefined
   */
    self.listLeaders = function(questNode) {
        return questNode.getProperty(gameConstants.QUEST_GUILD_LIST_PROPERTY);
    };

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
  };

}