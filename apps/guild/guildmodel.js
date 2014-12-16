/**
 * GuildModel
 */
var types = require('../../node_modules/tqtopicmap/lib/types'),
    icons = require('../../node_modules/tqtopicmap/lib/icons'),
    properties = require('../../node_modules/tqtopicmap/lib/properties'),
    Gameenv = require('../rpg/rpgenvironment'),
    constants = require('../../core/constants'),
    gameConstants = require('../rpg/gameconstants'),
    uuid = require('../../core/util/uuidutil'),
    Admin = require('../admin/adminmodel'),
    Tagmodel = require('../tag/tagmodel')
;

var GuildModel =  module.exports = function(environment) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        DataProvider = topicMapEnvironment.getDataProvider(),
        TopicModel = topicMapEnvironment.getTopicModel(),
        TagModel = new Tagmodel(environment),
        CommonModel = environment.getCommonModel(),
        queryDSL = topicMapEnvironment.getQueryDSL(),
        RPGEnvironment = environment.getRPGEnvironment(),
        AdminModel = new Admin(environment),
	
        self = this;
	
	self.getRPGEnvironment = function() {
		return RPGEnvironment;
	};
	
	
	  /**
	   * Update an existing blog entry; no tags included
	   */
	  self.update = function(blog,user,credentials,callback) {
		  myEnvironment.logDebug("Quest.UPDATE "+JSON.stringify(blog));
		  var lox = blog.locator;
		  DataProvider.getNodeByLocator(lox, credentials, function(err,result) {
			  var error = '';
			  if (err) {error += err;}
			  var title = blog.title;
			  var body = blog.body;
	    	  var lang = blog.language;
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
		    		  console.log("IssueModel.update "+error+" "+oldLabel+" "+title);
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
	  
	  /**
	   * Create a new Guild
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
            theGuild;
	    DataProvider.getNodeByLocator(userLocator, credentials, function(err,result) {
	      userTopic = result;
	      console.log('GuildModel.create-1 '+userLocator+' | '+userTopic);
	      // create the blog post
	      console.log("FOO "+types.GUILD_TYPE);
	      //NOTE: we are creating an AIR, which uses subject&body, not label&details
            //This creates the guild itself
	      TopicModel.newInstanceNode(uuid.newUUID(), types.GUILD_TYPE,
                                     "", "", constants.ENGLISH, userLocator,
                                     icons.COLLABORATION_SM, icons.COLLABORATION, false, credentials, function(err, article) {
	    	  var lang = blog.language;
	    	  if (!lang) {lang = "en";}
	    	  var subj = blog.title;
	    	  var body = blog.body;
              theGuild = article;
	    	  theGuild.setSubject(subj,lang,userLocator);
	    	  theGuild.setBody(body,lang,userLocator);
              //Tell it about its new member/leader
              theGuild.addSetValue(gameConstants.GUILD_MEMBER_LIST_PROPERTY, userLocator);
              theGuild.addSetValue(gameConstants.GUILD_LEADER_LIST_PROPERTY, userLocator);
              //grant guild credentials to user
              AdminModel.addToCredentials(user, theGuild.getLocator(), function(err, dx) {

                  //"credentials":["jackpark","78dc2560-7cd1-11e4-bbe7-2f2b0397e9a1"] showing added guild credentials
                  myEnvironment.logDebug("GuildModel.create-1 "+JSON.stringify(user));
                  RPGEnvironment.addRecentIssue(article.getLocator(),blog.title);
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

                              TopicModel.relateExistingNodesAsPivots(userTopic,article,types.CREATOR_DOCUMENT_RELATION_TYPE,
                                                                     userTopic.getLocator(),
                                                                     icons.RELATION_ICON, icons.RELATION_ICON, false, credentials, function(err,data) {
                                  if (err) {console.log('ARTICLES_CREATE-3d '+err);}
                                  return callback(err,article.getLocator());
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
                              return callback(err,article.getLocator());
                          }); //r1
                      }); //putnode
                  }
              }); // admin
	      });
	    });
	  };
	  
	  self.listGuilds = function(start, count, credentials, callback) {
	    var query = queryDSL.sortedDateTermQuery(properties.INSTANCE_OF,types.GUILD_TYPE,start,count);
	    DataProvider.listNodesByQuery(query, start,count,credentials, function(err, data, total) {
	      console.log("GuildModel.listIssues "+err+" "+data);
	      return callback(err, data, total);
	    });
	  };
	  
	  /**
	   * @param start
	   * @param count
	   * @param credentials
	   * @param callback signatur (data, countsent, totalavailable)
	   */
	  self.fillDatatable = function(start, count,credentials, callback) {
		  self.listGuilds(start,count,credentials,function(err,result, totalx) {
		      console.log('GuildModel.fillDatatable '+err+' '+totalx+" "+result);
		      CommonModel.fillSubjectAuthorDateTable(result,"/guild/",totalx, function(html, len, total) {
			      console.log("FILLING "+start+" "+count+" "+total);
			      return callback(html, len, total);
		      });
		  });
	  };
          
          /**
           * Return <code>true</code> if <code>userLocator</code> is a member of this guild
           * @param guildNode
           * @param userLocator
           * @return boolean
           */
      self.isMember = function(guildNode, userLocator) {
          var memlist = guildNode.getProperty(gameConstants.GUILD_MEMBER_LIST_PROPERTY);
          if (memlist) {
              var where = memlist.indexOf(userLocator);
              return (where > -1);
          }
          return false; // should never happen
      };
          
  /**
   * Return <code>true</code> if <code>userLocator</code> is a leader of this guild
   * @param guildNode
   * @param userLocator
   * @return boolean
   */
  self.isLeader = function(guildNode, userLocator) {
          var memlist = guildNode.getProperty(gameConstants.GUILD_LEADER_LIST_PROPERTY);
          if (memlist) {
              var where = memlist.indexOf(userLocator);
              return (where > -1);
          } else {
          return false; //should never happen since owner is always leader
        }
  };
	  
          /**
           * Add <code>userLocator</code> to <code>guildNode</code> and save it
           * @param guildNode
           * @param user  the JSON object from Request
           * @param callback signature ( err, data )
           */
      self.addMember = function(guildNode, user, callback) {
          guildNode.addSetValue(gameConstants.GUILD_MEMBER_LIST_PROPERTY, user.handle);
          AdminModel.addToCredentials(user, guildNode.getLocator(), function(err, dx) {
              DataProvider.putNode(guildNode, function(err, data) {
                  return callback(err, data);
              });
          });
      };
      
          /**
           * Remove <code>userLocator</code> from <code>guildNode</code> and save it
           * @param guildNode
           * @param user  the JSON object from Request
           * @param callback signature (err,data)
           */
      self.removeMember = function(guildNode, user, callback) {
          //TODO DO NOT REMOVE if length == 1
          guildNode.removeCollectionValue(gameConstants.GUILD_MEMBER_LIST_PROPERTY, userLocator);
          AdminModel.removeFromCredentials(user, guildNode.getLocator(), function(err, dx) {
              DataProvider.putNode(guildNode, function(err, data) {
                  return callback(err, data);
              });
          });
      };
      
          /**
           * Add <code>userLocator</code> to <code>guildNode</code> and save it
           * @param guildNode
           * @param userLocator
           * @param callback signature ( err, data )
           */
      self.addLeader = function(guildNode, userLocator, callback) {
          guildNode.addSetValue(gameConstants.GUILD_LEADER_LIST_PROPERTY, userLocator);
          DataProvider.putNode(guildNode, function(err, data) {
              return callback(err, data);
          });
      };
      
          /**
           * Remove <code>userLocator</code> from <code>guildNode</code> and save it
           * @param guildNode
           * @param userLocator
           * @param callback signature (err,data)
           */
      self.removeLeader = function(guildNode, userLocator, callback) {
          //TODO DO NOT REMOVE IF length == 1
          guildNode.removeCollectionValue(gameConstants.GUILD_LEADER_LIST_PROPERTY, userLocator);
          DataProvider.putNode(guildNode, function(err, data) {
              return callback(err, data);
          });
      };
          /**
           * Set this quild's current quest to <code>questLocator</code> and save it
           * @param guildNode
           * @param questLocator
           * @param callback signature (err,data)
           */
      self.setCurrentQuest = function(guildNode, questLocator, callback) {
          guildNode.addSetValue(gameConstants.GUILD_CURRENT_QUEST_PROPERTY, questLocator);
          DataProvider.putNode(guildNode, function(err, data) {
              return callback(err, data);
          });          
      };

                /**
           * Add <code>questLocator</code> to <code>guildNode</code> and save it
           * @param questLocator
           * @param userLocator
           * @param callback signature ( err, data )
           */
      self.addQuest = function(guildNode, questLocator, callback) {
          guildNode.addSetValue(gameConstants.GUILD_QUEST_LIST_PROPERTY, questLocator);
          DataProvider.putNode(guildNode, function(err, data) {
              return callback(err, data);
          });
      };
      
          /**
           * Remove <code>questLocator</code> from <code>guildNode</code> and save it
           * @param guildNode
           * @param userLocator
           * @param callback signature (err,data)
           */
      self.removeQuest = function(guildNode, questLocator, callback) {
          guildNode.removeCollectionValue(gameConstants.GUILD_QUEST_LIST_PROPERTY, questLocator);
          DataProvider.putNode(guildNode, function(err, data) {
              return callback(err, data);
          });
      };
          /**
           * Return a list of guild members
           * @param guildNode
           * @return list or undefined
           */
      self.listMembers = function(guildNode) {
          return guildNode.getProperty(gameConstants.GUILD_MEMBER_LIST_PROPERTY);
      };
          
          /**
           * Return a list of guild leaders
           * @param guildNode
           * @return list or undefined
           */
      self.listLeaders = function(guildNode) {
          return guildNode.getProperty(gameConstants.GUILD_LEADER_LIST_PROPERTY);
      };
              

}