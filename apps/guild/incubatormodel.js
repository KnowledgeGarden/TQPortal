/**
 * GuildModel
 */
var types = require('../../node_modules/tqtopicmap/lib/types'),
    icons = require('../../node_modules/tqtopicmap/lib/icons'),
    properties = require('../../node_modules/tqtopicmap/lib/properties'),
    Gameenv = require('../rpg/rpgenvironment'),
    Infobox = require('../rpg/guildquestinfobox'),
    gameConstants = require('../rpg/gameconstants'),
    constants = require('../../core/constants'),
    uuid = require('../../core/util/uuidutil'),
    Conmodel = require('../conversation/conversationmodel'),
    Colnavwidget = require('../widgets/jquerycolnav'),
    Conmodel = require('../conversation/conversationmodel')

;

var IncubatorModel =  module.exports = function(environment) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        DataProvider = topicMapEnvironment.getDataProvider(),
        TopicModel = topicMapEnvironment.getTopicModel(),
        CommonModel = environment.getCommonModel(),
        queryDSL = topicMapEnvironment.getQueryDSL(),
        RPGEnvironment = environment.getRPGEnvironment(),
        ColNavWidget = new Colnavwidget(environment, DataProvider),
        ConversationModel = new Conmodel(environment),
	
        self = this;
    
    /**
     * Utility for incubator.js
     */
    self.getConversationModel = function() {
        return ConversationModel;
    },
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
      },
          
           /**
           * Return <code>true</code> if <code>userLocator</code> is a leader of this guild
           * @param guildNode
           * @param userLocator
           * @return boolean
           */
     self.isLeader = function(guildNode, userLocator) {
          var memlist = guildNode.getProperty(gameConstants.GUILD_LEADER_LIST_PROPERTY);
          myEnvironment.logDebug("IncubatorModel.isLeader "+userLocator+" "+memlist);
          if (memlist) {
              var where = memlist.indexOf(userLocator);
              return (where > -1);
          }
          return false; //should never happen since owner is always leader
      },

          /////////////////////////////////////////////////
          // Note:
          // Nearly all of the following methods rely on the context that the
          // user initiating these requests is, in fact, a Guild Leader
          // That is why we can pass in the Guild Node; we had to fetch it to
          // confirm the user's credentials
          /////////////////////////////////////////////////
          /**
           * The guild <code>guildNode</code> is joining the quest identified by <code>questLocator</code>
           * @param guildNode
           * @param questLocator
           * @ param usr  the user object from Request
           * @param callback siganture (err)
           */
      self.joinQuest = function(guildNode, questLocator, usr, callback ) {
          myEnvironment.logDebug("IncubatorModel.joinQuest ");
          var credentials = usr.credentials,
              error = "",
              language = "en",  //TODO
              infobox = guildNode.getInfoBox(questLocator);
          myEnvironment.logDebug("IncubatorModel.joinQuest-1 "+questLocator+" "+infobox);
          if (!infobox) {
              //it doesn't exist: we must create it.
              DataProvider.getNodeByLocator(questLocator, credentials, function(err, quest) {
                  if (err) {error += err;}
                  var title = quest.getSubject(language).theText;
                  //create a new Meta conversation map
                  var bx = {};
                  bx.title = "Meta Conversation";
                  bx.body = "";
                  bx.language = "en"; //TODO
                  ConversationModel.createMap(bx, usr, null, credentials, function(err, qnode) {
                          if (err) {error += err}
                      qnode.setIsPrivate(true); // make it private
                      qnode.addACLValue(guildNode.getLocator()); // add to ACL
                      qnode.setCreatorId(guildNode.getLocator()); // the guild is the creator
                      myEnvironment.logDebug("IncubatorModel.joinQuest-2 "+qnode);
                      myEnvironment.logDebug("IncubatorModel.joinQuest-3 "+JSON.stringify(qnode));
                      //persist the modified node
                      DataProvider.putNode(qnode, function(err, dx) {
                          //create the GuildQuestInfobox to represent this pair
                          infobox = new Infobox(questLocator,title);
                          infobox[Infobox.META_TREE_ROOT_LOCATOR] = qnode.getLocator();
                          guildNode.setProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY, questLocator);
                          myEnvironment.logDebug("IncubatorModel.joinQuest-4 "+JSON.stringify(infobox));
                          guildNode.putInfoBox(questLocator, JSON.stringify(infobox));
                          guildNode.setLastEditDate(new Date());
                          DataProvider.putNode(guildNode, function (err, data) {
                              if (err) {error += err;}
                              return callback(error);
                          });
                      });
                  });
              });
          } else {
              //otherwise, just tell the guild what its current quest is
              guildNode.setProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY, questLocator);
              guildNode.setLastEditDate(new Date());
              DataProvider.putNode(guildNode, function (err, data) {
                  if (err) {error += err;}
                  return callback(error);
              });
          }
      },
        
        /**
         * Augment ConversationModel creating incubator nodes to add privacy and ACLs
         */
        self.createOtherNode = function(blog, user, credentials, callback) {
            var guildLocator = blog.locator;
                    myEnvironment.logDebug("GUILD LOCATOR -4 "+guildLocator); // debug establish the identity of this guild.

            // create the node
            ConversationModel.createOtherNode(blog, user, credentials, function(err, qnode) {
                //now make it private with ACL
                qnode.setIsPrivate(true); // make it private
                qnode.addACLValue(guildLocator); // add to ACL
                qnode.setCreatorId(guildLocator); // the guild is the creator
                myEnvironment.logDebug("IncubatorModel.createOtherNode "+qnode.toJSON());
                DataProvider.putNode(qnode, function(err, data) {
                    return callback(err, data);
                });

            });
        },

          /**
           * The guild <code>guildNode</code> has chosen to leave the quest identified by <code>questLocator</code>
           * @param guildNode
           * @param questLocator
           * @param callback signature (err)
           */
      self.leaveQuest = function(guildNode, questLocator, callback ) {
          guildNode.setProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY, "");
          DataProvider.putNode(guildNode, function (err, data) {
              return callback(err);
          });
      },

          /**
           * A guild leader has chosen a node from the guild's current quest's game tree as the root for further game play
           * @param guildNode
           * @param rootNodeLocator
           * @param user the user object from Request
           * @param callback signature (err)
           */
      self.setQuestRootNodeLocator = function(guildNode,  rootNodeLocator, usr, callback ) {
          var credentials = usr.credentials,
              questLocator = guildNode.getProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY),
              infobox = guildNode.getInfoBox(questLocator);
          //NOTE: it is a profound error condition if infobx does not exist or if the guild doesn't have a current quest
          // turn string into JSON object
          var ib = JSON.parse(infobox);
          myEnvironment.logDebug("IncubatorModel.setQuestRootNodeLocator "+infobox+" | "+JSON.stringify(ib));
          ib[Infobox.QUEST_CONTEXT_LOCATOR] = rootNodeLocator;
          myEnvironment.logDebug("IncubatorModel.setQuestRootNodeLocator-1 "+JSON.stringify(ib));
          guildNode.putInfoBox(questLocator, JSON.stringify(ib));
          guildNode.setLastEditDate(new Date());
          DataProvider.putNode(guildNode, function (err, data) {
              return callback(err);
          });
      },
          
          /**
           * Return the chosen quest root node from the guild's current quest
           * @param guildNode
           * @param user the user object from Request
           * @param callback signature(err, rootnode) can return rootnode = undefined if no root chosen
           */
      self.getGameTree = function(guildNode, usr, callback ) {
          var credentials = usr.credentials,
              questLocator = guildNode.getProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY),
              infobox = guildNode.getInfoBox(questLocator),
              lang = "en"; //TODO
              myEnvironment.logDebug("IncubatorModel.getGameTree "+questLocator+" | "+infobox);
          var ib = JSON.parse(infobox),
              rootLocator = ib[Infobox.QUEST_CONTEXT_LOCATOR],
              rootNode; // leave undefined
           myEnvironment.logDebug("IncubatorModel.getGameTree-1 "+rootLocator+" | "+infobox);
         if (rootLocator) {
             DataProvider.getNodeByLocator(rootLocator, credentials, function(err, rn) {
                 //var contextLocator = rootLocator; // we are getting this tree WRONG
                 var contextLocator = guildNode.getLocator();
                 var js = "javascript:fetchFromGameTreeTree",
                     aux = "&guildLocator="+guildNode.getLocator();
                 ColNavWidget.makeColNav(rootLocator, rn, contextLocator, lang, js, "/incubator/ajaxtreefetch/", aux, credentials, function(err, html) {
                      callback(err, html);
                 });
             });
           } else {
              callback("Missing rootLocator", rootNode);
          }
      },
      
      self.getMetaTree = function(guildNode, usr, callback ) {
          var credentials = usr.credentials,
              questLocator = guildNode.getProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY),
              infobox = guildNode.getInfoBox(questLocator);
               myEnvironment.logDebug("IncubatorModel.getMetaTree "+questLocator+" "+infobox);
          var ib = JSON.parse(infobox),
              lang = "en", //TODO
              rootLocator = ib[Infobox.META_TREE_ROOT_LOCATOR],
              rootNode; // leave undefined
          myEnvironment.logDebug("IncubatorModel.getMetaTree-1 "+rootLocator+" "+infobox);
          if (rootLocator) {
             DataProvider.getNodeByLocator(rootLocator, credentials, function(err, rn) {
                 // var contextLocator = rootLocator; // we are getting this tree WRONG
                 var contextLocator = guildNode.getLocator();
                 var js = "javascript:fetchFromMetaTree",
                     aux = "&guildLocator="+guildNode.getLocator();
                 ColNavWidget.makeColNav(rootLocator, rn, contextLocator, lang, js, "/incubator/ajaxtreefetch/", aux, credentials, function(err, html) {
                      myEnvironment.logDebug("IncubatorModel.getMetaTree-1 "+rootLocator+" "+html);
                      callback(err, html);
                 });
             });
           } else {
              callback("Missing rootLocator", rootNode);
          }
      }


};