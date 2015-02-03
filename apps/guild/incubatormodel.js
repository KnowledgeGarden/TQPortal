/**
 * GuildModel
 */
var types = require('tqtopicmap/lib/types'),
    extendedTypes = require('../../core/extendedtypology'),
    icons = require('tqtopicmap/lib/icons'),
    properties = require('tqtopicmap/lib/properties'),
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
      RPGEnvironment = environment.getRPGEnvironment(),
      ColNavWidget = new Colnavwidget(environment, DataProvider),
      ConversationModel = new Conmodel(environment),

      self = this;
    
  /**
   * Utility for incubator.js
   */
  self.getConversationModel = function() {
    return ConversationModel;
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
    myEnvironment.logDebug("IncubatorModel.isLeader "+userLocator+" "+memlist);
    if (memlist) {
      var where = memlist.indexOf(userLocator);
      return (where > -1);
    }
    return false; //should never happen since owner is always leader
  };

  /////////////////////////////////////////////////
  // Note:
  // Nearly all of the following methods rely on the context that the
  // user initiating these requests is, in fact, a Guild Leader
  // That is why we pass in the Guild Node; we had to fetch it to
  // confirm the user's credentials
  /////////////////////////////////////////////////
  /**
   * The guild <code>guildNode</code> is joining the quest identified by <code>questLocator</code>
   * @param guildNode
   * @param questLocator note: this is not only the quest itself, but the root node for that quest
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
    ////////////////////////////////////////////
    //TODO TELL Quest it has a Guild playing it
    // NEEDS a Struct, not just a locator
    ////////////////////////////////////////////
    if (!infobox) {
      //it doesn't exist: we must create it.
      DataProvider.getNodeByLocator(questLocator, credentials, function(err, quest) {
        if (err) {error += err;}
        if (quest) {
          var title = quest.getSubject(language).theText,
              isPrivate = true;
          //create a new Meta conversation map
          var bx = {};
          bx.title = "Meta Conversation";
          bx.body = "";
          bx.language = "en"; //TODO
          //CREATE the Meta Conversation
          ConversationModel.createMap(bx, usr, null, true, credentials, function(err, qnode) {
            if (err) {error += err}
            qnode.addACLValue(guildNode.getLocator()); // add to ACL
            qnode.setCreatorId(guildNode.getLocator()); // the guild is the creator
            myEnvironment.logDebug("IncubatorModel.joinQuest-2 "+qnode);
            myEnvironment.logDebug("IncubatorModel.joinQuest-3 "+JSON.stringify(qnode));
            //persist the modified node
            DataProvider.putNode(qnode, function(err, dx) {
              //create the GuildQuestInfobox to represent this pair
              infobox = new Infobox(questLocator,title);
              infobox[Infobox.META_TREE_ROOT_LOCATOR] = qnode.getLocator();
              //set the root node locator
              infobox[Infobox.QUEST_CONTEXT_LOCATOR] = questLocator;
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
        } else {
          return callback(error);
        }
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
  };
        
  /**
   * Augment ConversationModel creating incubator nodes to add privacy and ACLs
   */
  self.createOtherNode = function(blog, user, credentials, callback) {
    var guildLocator = blog.contextLocator,
        error = '';
    blog.isPrivate = true;
    myEnvironment.logDebug("GUILD LOCATOR -4 "+guildLocator); // debug establish the identity of this guild.

    // create the node
    ConversationModel.createOtherNode(blog, user, credentials, function(err, qnode) {
      if (err) {error += err;}
      //now make it private with ACL
      if (qnode) {
        qnode.addACLValue(guildLocator); // add to ACL
        qnode.setCreatorId(guildLocator); // the guild is the creator
        myEnvironment.logDebug("IncubatorModel.createOtherNode "+qnode.toJSON());
        DataProvider.putNode(qnode, function(err, data) {
          if (err) {error += err;}
          return callback(error, data);
        });
      } else {
        return callback(error, qnode);
      }
    });
  };

  //   
  self.update = function(blog, user, credentials, callback) {
    ConversationModel.update(blog, user, credentials, function(err, data) {
      return callback(err, data);
    });
  };

  /**
   * The guild <code>guildNode</code> has chosen to leave the quest identified by <code>questLocator</code>
   * @param guildNode
   * @param callback signature (err)
   */
  self.leaveQuest = function(guildNode, callback ) {
    guildNode.setProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY, "");
    DataProvider.putNode(guildNode, function (err, data) {
      return callback(err);
    });
  };

  ////////////////////////////////////////////////
  // GamePlay against a chosen root node from a Quest is a complex issue:
  //   Conducting In-Guild Play against the chosen node is problematic because:
  //      1- you will be attaching child nodes to that node as you build your game move tree
  //      2- other guilds might be doing exactly the same thing
  //        That becomes problematic each time a guild re-fetches that root node
  //        to continue playing; other guild's nodes will now be there, even though
  //        not visible in other guilds due to ACLs.
  //   The issue arrises the moment the Play button is clicked.
  //   That process ripples down the child nodes of the selected root, making them
  //     all public.
  //   There are two solutions to this issue:
  //      1- Create a MockRootNode which is like the root node, but not it, and play
  //         against that
  //      2- Rely on the fact that one guild cannot see the child nodes of another guild
  //         and thus switch to public only those nodes that guild can fetch.
  //   There was an exploration of MockRootNode, but it has been discarded in favor of
  //     plan 2.
  //////////////////////////////////////////////////


  /**
   * A guild leader has chosen a node from the guild's current quest's game tree as the root for further game play
   * @param guildNode
   * @param rootNodeLocator
   * @param user the user object from Request
   * @param callback signature (err)
   */
  self.setQuestRootNodeLocator = function(guildNode,  rootNodeLocator, usr, callback ) {
    var error = "",
        credentials = usr.credentials,
        questLocator = guildNode.getProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY),
        infobox = guildNode.getInfoBox(questLocator);
    //NOTE: it is a profound error condition if infobx does not exist or if the guild doesn't have a current quest
    // turn string into JSON object
    //////////////////////////////////////////
    //TODO we are given a root node.
    // We MUST create a MockProxy which contains the root's subject and body
    // to build against that.
    //THIS MEANS INFOBOX must make room for MockLocator, as well as RootLocator
    //INFOBOX must also make room for quest root history
    //////////////////////////////////////////
    var ib = JSON.parse(infobox);
    myEnvironment.logDebug("IncubatorModel.setQuestRootNodeLocator "+infobox+" | "+JSON.stringify(ib));
    ib[Infobox.QUEST_CONTEXT_LOCATOR] = rootNodeLocator;
    myEnvironment.logDebug("IncubatorModel.setQuestRootNodeLocator-1 "+JSON.stringify(ib));
    guildNode.putInfoBox(questLocator, JSON.stringify(ib));
    guildNode.setLastEditDate(new Date());
    DataProvider.putNode(guildNode, function (err, data) {
      return callback(err);
    });
  };
          
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
    var ib, rootLocator;
    if (infobox) {
      ib = JSON.parse(infobox);
      rootLocator = ib[Infobox.QUEST_CONTEXT_LOCATOR];
    }
    myEnvironment.logDebug("IncubatorModel.getGameTree "+questLocator+" | "+infobox);
    var rootNode, // leave undefined
        error = '',
        retval;
    myEnvironment.logDebug("IncubatorModel.getGameTree-1 "+rootLocator+" | "+infobox);
    if (rootLocator) {
      DataProvider.getNodeByLocator(rootLocator, credentials, function(err, rn) {
        if (err) {error += err;}
        if (rn) {
          //var contextLocator = rootLocator; // we are getting this tree WRONG
          var contextLocator = guildNode.getLocator(),
              js = "javascript:fetchFromGameTreeTree",
              aux = "&guildLocator="+guildNode.getLocator();
          ColNavWidget.makeColNav(rootLocator, rn, contextLocator, lang, js, "/incubator/ajaxtreefetch/", aux, credentials, function(err, html) {
            return callback(err, html);
          });
        } else {
          return callback(error, retval);
        }
      });
    } else {
      return callback("Missing rootLocator", rootNode);
    }
  };
      
  self.getMetaTree = function(guildNode, usr, callback ) {
    var credentials = usr.credentials,
        questLocator = guildNode.getProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY),
        infobox = guildNode.getInfoBox(questLocator);
    myEnvironment.logDebug("IncubatorModel.getMetaTree "+questLocator+" "+infobox);
    var ib , rootLocator;
    if (infobox) {
      ib = JSON.parse(infobox);
      rootLocator = ib[Infobox.META_TREE_ROOT_LOCATOR];
    }
    var lang = "en", //TODO
        error = '',
        rootNode; // leave undefined
    myEnvironment.logDebug("IncubatorModel.getMetaTree-1 "+rootLocator+" "+infobox);
    if (rootLocator) {
      DataProvider.getNodeByLocator(rootLocator, credentials, function(err, rn) {
        if (err) {error += err;}
        if (rn) {
          // var contextLocator = rootLocator; // we are getting this tree WRONG
          var contextLocator = guildNode.getLocator(),
              js = "javascript:fetchFromMetaTree",
              aux = "&guildLocator="+guildNode.getLocator();
          ColNavWidget.makeColNav(rootLocator, rn, contextLocator, lang, js, "/incubator/ajaxtreefetch/", aux, credentials, function(err, html) {
            myEnvironment.logDebug("IncubatorModel.getMetaTree-1 "+rootLocator+" "+html);
            return callback(err, html);
          });
        } else {
          return callback(error, rootnode);
        }
      });
    } else {
      return callback("Missing rootLocator", rootNode);
    }
  };

  self.getQuestTitle = function(guildNode) {
    var questLocator = guildNode.getProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY);
    //issue that this guild might not be in a quest yet;
    if (questLocator) {
      var infobox = guildNode.getInfoBox(questLocator);
          myEnvironment.logDebug("IncubatorModel.getQuestTitle "+questLocator+" | "+infobox+" | "+guildNode.toJSON());
      var ib = JSON.parse(infobox);
      return ib.questTitle;
    } else {
      return "No Quest Chosen";
    }
  };

  ///////////////////////////////////////////////////
  //NOTE: this whole PLAY process is constantly messing with Guild GameTree nodes
  // among possibly many guilds.
  // There is bound to be a risk of OptimisticLockException given that TQTopicMap
  // in theory looks at node version.
  // At the moment, it's not clear that we are using node version in TQTopicMap
  //////////////////////////////////////////////////
  /**
   * Recursive-descent down tree from <code>treeNode</code> to turn every node
   * that is private to not private
   * @param treeNode
   * @aparam contextLocator
   * @param questLocator is the proper context for all child and parent links after this process
   * @param parentList is really every treeNode in this process
   * @param credentials
   * @param callback signature (err)
   */
  self._unPrivatizeNode = function(treeNode, contextLocator, questLocator, parentList, credentials, callback) {
    myEnvironment.logDebug("IncubatorModel._unprivatizeNode "+treeNode.toJSON());
    var isPrivate = treeNode.getIsPrivate(),
        error = "",
        snapper,
        childNodes = treeNode.listChildNodes(contextLocator),
        parents = treeNode.listParentNodes(contextLocator);
        //there will only be one for this context
    //if a node doesn't have a parent in this context, then it's likely the quest's root
    //////////////////////////////////////////
    // parent looks like: (based on TQTopicMap childstruct.js)
    // {
    //  "contextLocator": "1211e690-82fc-11e4-90ac-9d4edb06f071",
    //  "locator": "fe623a50-82fb-11e4-b551-afa44c1622fc",
    //  "subject": "What are the Causal Issues related to Climate Change?",
    //  "smallImagePath": "/images/ibis/issue_sm.png"
    // }
    //////////////////////////////////////////
    if (parents && parents.length > 0) {
      var parentI = parents[0];
      myEnvironment.logDebug("IncubatorModel._unprivatizeNode-1 "+treeNode.getLocator()+" | "+parentI+" | "+JSON.stringify(parentI));
      var parentLocator = parentI.locator;
      //For reasons that are truly baffling, sometimes parentI is a JSON object, others, it is a JSON string
      if (!parentLocator) {
        parentStruct = JSON.parse(parentI);
        parentLocator = parentStruct.locator;
      } else {
        parentStruct = parentI;
      }
      //Validate whether this node has a proper parent
      var trueParent = treeNode.listParentNodes(questLocator);
      if (!trueParent) {
        treeNode.addParentNode(questLocator, parentStruct.smallImagePath, parentLocator, parentStruct.subject);
      }
    }

    if (isPrivate) {
      /////////////////////////////////////////
      //If it's private and one of ours (by way of contextLocator)
      //Then, add a fresh parent in the context of questLocator
      /////////////////////////////////////////
      treeNode.setIsPrivate(false);
    }
    //save for later persistence
    parentList.push(treeNode);
    var transcludelocator;  // leave undefined
      myEnvironment.logDebug("IncubatorModel._unPrivatizeNode-1A "+treeNode.getLocator()+" "+isPrivate);
      //Child nodes only belong to this context
      if (childNodes && childNodes.length > 0) {
        for (var i=0; i < childNodes.length; i++) {
          snapper = childNodes[i];
          myEnvironment.logDebug("IncubatorModel._unPrivatizeNode-1AA "+snapper+" "+JSON.stringify(snapper));
          ///////////////////////////////////////////////
          // A snapper is a struct:
          //{
          // "contextLocator":"c6a069b0-7c35-11e4-89c3-f38cc6e9e29e",
          // "locator":"c6ad8910-7c35-11e4-a6ba-75dddcacfe02",
          // "subject":"What do we know about causes of climate change?",
          // "smallImagePath":"/images/ibis/issue_sm.png"
          //}
          ///////////////////////////////////////////////
          DataProvider.getNodeByLocator(snapper.locator, credentials, function(err, data) {
            if (err) {error += err;}
            if (data) {
              myEnvironment.logDebug("IncubatorModel._unPrivatizeNode-2a "+snapper);
              //Firstly, add a childNode to treeNode (the parent of this node)
              //contextLocator, smallIcon, locator, subject, transcluderLocator
              //TODO language
              treeNode.addChildNode(questLocator, data.getSmallImage(), snapper.locator, data.getSubject(constants.ENGLISH).theText, transcludelocator);
              //now, recurse on this puppy
              self._unPrivatizeNode(data, contextLocator, questLocator, parentList, credentials, function(err) {
                 if (err) {error += err;}
                 //stay in loop 
              });
            }
          });
        }
        myEnvironment.logDebug("IncubatorModel._unPrivatizeNode+a "+treeNode.getLocator()+" "+childNodes);
        return callback(error);
      } else {
        myEnvironment.logDebug("IncubatorModel._unPrivatizeNode+aa "+treeNode.getLocator()+" "+childNodes);
        return callback(error);
      }

  };

  //////////////////////////////////////////////////
  //Play:
  //   1-makes public the GameTree game moves of a guild
  //   2-Adds new context children to the root node
  //   3-Adds new context parent to each node
  //
  //NOTE: a similar implementation can make public the guild's meta conversation
  //////////////////////////////////////////////////
  /**
   * The Big Kahuna: move a guild's GameTree out to the main public arena
   *   the process is simple: convert all game subtree nodes (the guild's game moves) to public
   * @param guildNode
   * @param usr  the JSON object from Request -- by default, is a leader
   * @param callback signature (err)
   */
  self.play = function(guildNode, usr, callback) {
    var credentials = usr.credentials,
        error = "",
        questLocator = guildNode.getProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY),
        infobox = guildNode.getInfoBox(questLocator);
    myEnvironment.logDebug("IncubatorModel.play "+questLocator+" "+infobox);
    var ib = JSON.parse(infobox),
        lang = "en", //TODO
        rootLocator = ib[Infobox.QUEST_CONTEXT_LOCATOR],
        questLocator = ib[Infobox.QUEST_LOCATOR],
        rootNode; // leave undefined
    myEnvironment.logDebug("IncubatorModel.play-1 "+rootLocator+" "+infobox);
    if (rootLocator) {
      //Fetch the Root Node
      DataProvider.getNodeByLocator(rootLocator, credentials, function(err, rx) {
        if (err) {error += err;}
        if (rx) {
          var contextLocator = guildNode.getLocator(),
          parentList = [],
          nx;
          //Process this guild's game moves
          self._unPrivatizeNode(rx, contextLocator, questLocator, parentList, credentials, function(err) {
            if (err) {error += err;}
            //Now, save all the processed nodes
            myEnvironment.logDebug("IncubatorModel.play-2 "+parentList);
            for (var i = 0; i < parentList.length; i++) {
              nx = parentList[i];
              nx.setLastEditDate(new Date());
              myEnvironment.logDebug("IncubatorModel.play-3 "+nx.toJSON());
              DataProvider.putNode(nx, function(err, data) {
                if (err) {error += err;}
                //Stay in loop
              });
            }
            return callback(error);
           });
        } else {
          return callback(error);
        }
      });
    } else {
      myEnvironment.logError("IncubatorModel.play  missing rootLocator for: "+guildNode.getLocator);
      return callback("Missing rootLocator");
    }
   };

  self.performTransclude = function(body, user, isEvidence, callback) {
    ConversationModel.performTransclude(body, user, isEvidence, function(err, data) {
      return callback(err, data);
    });
  };


};