/**
 * IncubatorApp -- the space inside a Guild where game-play occurs
 * This app is really created by GuildModel when a new Guild is created.
 * That guild then owns this incubator;
 *   its Enter button exists on the guild's landing page
 *   and is only visible when an authenticated user is a member of the guild
 */
var Incmodel = require('../apps/guild/incubatormodel'),
    constants = require('../core/constants'),
    gameConstants = require('../apps/rpg/gameconstants'),
    conversationConstants = require('../apps/conversation/conversationconstants'),
//    common = require('./common/commonmodel'),
    types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        CommonModel = environment.getCommonModel(),
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        IncubatorModel = new Incmodel(environment),
        self = this;
    console.log("Incubator up");
    
 
  function isPrivate(req, res, next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {return next();}
			res.redirect('/login');
		} else {
			return next();
		}
	}
  
  function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    console.log('ISLOGGED IN '+req.isAuthenticated());
    if (req.isAuthenticated()) {return next();}
    // if they aren't redirect them to the home page
    // really should issue an error message
    if (isPrivatePortal) {
      return res.redirect('/login');
    }
    res.redirect('/');
  }

  /////////////////
  // Routes
  /////////////////
    
    /**
     * Edits in incubator are always game nodes
     */
  app.get('/incubator/edit/:id', isPrivate, function(req, res) {
    var q = req.params.id,
        contextLocator = req.query.contextLocator;
        usx = req.user;
    myEnvironment.logDebug("Incubator.edit "+q+" "+usx);
    if (usx) {
      var credentials = usx.credentials,
          data =  myEnvironment.getCoreUIData(req);
      data.isedit = "T";
      data.formtitle = "Edit Node";
      Dataprovider.getNodeByLocator(q, credentials, function(err, result) {
        myEnvironment.logDebug("Incubator.edit-1 "+q+" "+result);
        if (result) {
          data.title = result.getSubject(constants.ENGLISH).theText;
        }
        if (result.getBody(constants.ENGLISH)) {
          data.body = result.getBody(constants.ENGLISH).theText;
        }
        data.locator = result.getLocator();
        data.context = contextLocator;
        data.isNotEdit = false;
        return res.render('incubatorconversationform', data); //,
      });
    } else {
      //fall through to here:
      myEnvironment.logDebug("Incubator.edit-bad "+q+" "+usx);
      return res.redirect("/"); //TODO should be a 500
    }
  });

  /**
   * Leader has chosen to make a game move
   */
  app.get("/incubator/play/:id", isPrivate, function(req, res) {
    var q = req.params.id;
     myEnvironment.logDebug("GUILD LOCATOR -Play "+q); // debug establish the identity of this guild after ajax fetch
    //establish credentials
    //defaults to an empty array if no user logged in
    var credentials = [],
        usr = req.user;
    if (usr) { 
      credentials = usr.credentials;
      //fetch the node itself
      Dataprovider.getNodeByLocator(q, credentials, function(err, guildnode) {
        //sanity check
        if (IncubatorModel.isLeader(guildnode, usr.handle)) {
          IncubatorModel.play(guildnode, usr, function(err) {
            return res.redirect("/incubator/"+q);
          });
        } else {
          return res.redirect("/incubator/"+q);
        }
      });
    } else {
      // fall through to here
      //not supposed to be here
     return res.redirect("/");
    }
        
  });

  /**
   * Leave the incubator room
   */
  app.get('/incubator/leave', function(req, res) {
    var q = req.params.id;
     myEnvironment.logDebug("GUILD LOCATOR -Play "+q); // debug establish the identity of this guild after ajax fetch
    //establish credentials
    //defaults to an empty array if no user logged in
    var credentials = [],
        usr = req.user;
    if (usr) { 
      credentials = usr.credentials;
      //fetch the node itself
      Dataprovider.getNodeByLocator(q, credentials, function(err, guildnode) {
        //sanity check
        if (IncubatorModel.isLeader(guildnode, usr.handle)) {
          IncubatorModel.leaveQuest(guildnode,  function(err) {
            return res.redirect("/incubator/"+q);
          });
        } else {
          return res.redirect("/incubator/"+q);
        }
      });
    } else {
      // fall through to here
      //not supposed to be here
     return res.redirect("/");
    }  });
    
  ///////////////////////////////////////////////////////
  // Conversation facade
  //   Provide an input into the various IBIS conversationapp features
  //   but with ability to return to the incubator
  ///////////////////////////////////////////////////////
  /**
   * Configure a conversation node form
   */
  var __getNewSomething = function(q, type, req,res) {
    var contextLocator = req.query.contextLocator,
        data = environment.getCoreUIData(req),
      label = "New Map Node"; //default
    if (type === conversationConstants.QUESTIONTYPE) {label = "New Question/Issue Node";}
    else if (type === conversationConstants.ANSWERTYPE) {label = "New Answer/Position Node";}
    else if (type === conversationConstants.PROTYPE) {label = "New Pro Argument Node";}
    else if (type === conversationConstants.CONTYPE) {label = "New Con Argument Node";}
    //otherwise, default
    data.formtitle = label;
    data.locator = q;
    myEnvironment.logDebug("GUILD LOCATOR -3 "+q); // debug establish the identity of this guild.
    //trying to prove that guild identity made it here from the button query strings

    data.nodetype = type;
    data.context = contextLocator;
    data.contextLocator = contextLocator;
    data.isNotEdit = true;
    data.body = "";
    return res.render('incubatorconversationform', data);
  };
  
  app.get('/incubator/newMap/:id', isPrivate, function(req,res) {
    var q = req.params.id;
    __getNewSomething(q, conversationConstants.MAPTYPE, req, res);
  });
  app.get('/incubator/newIssue/:id', isPrivate, function(req,res) {
    var q = req.params.id,
        cx = req.query.contextLocator;
    myEnvironment.logDebug("GUILD LOCATOR -2A "+q+" "+cx);
    console.log("Conversation.newIssue");
    __getNewSomething(q, conversationConstants.QUESTIONTYPE, req, res);
  });
  app.get('/incubator/newPosition/:id', isPrivate, function(req,res) {
    var q = req.params.id;
    __getNewSomething(q, conversationConstants.ANSWERTYPE, req, res);
  });
  app.get('/incubator/newPro/:id', isPrivate, function(req,res) {
    var q = req.params.id;
    __getNewSomething(q, conversationConstants.PROTYPE, req, res);
  });
  app.get('/incubator/newCon/:id', isPrivate, function(req,res) {
    var q = req.params.id;
    __getNewSomething(q, conversationConstants.CONTYPE, req, res);
  });

    
  ///////////////////////////////////////////////////////
  // Both "JoinQuest" and "SelectRootNode" require a node "remembered on the clipboard
  // This creates an outrageous ambiguity:
  //   the clipboard might have selected a quest or a root node.
  //   HOW TO DECIDE WHICH?
  // So there is a necessary logic
  // 1- if there is no currentQuest, only show Join Quest
  // 2- Otherwise, show both
  // NOTE: show both on a lone clipboard means that only one is correct
  // For this prototype, we are relying on Guild Leaders to do the right thing
  //
  ///////////////////////////////////////////////////////

  /**
   * An Incubator view is a viewfirst view, but not in conversation mode.
   * Its conversations are performed inside the incubator in two spaces:
   *  one for a meta conversation which is the guild deciding what to play
   *  one for the game moves themselves
   * This route is associated with an Enter button at the Guild's landing page
   * That Enter Button is not available to any other than a guild member
   */
  app.get('/incubator/:id', isPrivate, function(req, res) {
    //establish the node's identity
    var usr = req.user;
    //sanity check
    if (usr) {
      var q = req.params.id,
      //did user select a quest to join or node to select?
      questLocator = req.session.clipboard;

      myEnvironment.logDebug("GUILD LOCATOR -1X "+q); // debug establish the identity of this guild.
			credentials = usr.credentials;
      Dataprovider.getNodeByLocator(q, credentials, function(err, dx) {
        myEnvironment.logDebug("INCUBATORX "+q);
        var data =  myEnvironment.getCoreUIData(req);
        data.guildlocator = q;
        data.questTitle = IncubatorModel.getQuestTitle(dx);
        if (questLocator) {
          data.locator = questLocator;
        }
        var curquest = dx.getProperty(gameConstants.GUILD_CURRENT_QUEST_PROPERTY);
        if (curquest) {
          data.nodelocator = questLocator;
          data.inQuest = inQuest = "true";
          if (IncubatorModel.isLeader(dx, usr.handle)) {
            data.leaderInQuest = "true";
          }
        }
        data.query = "/incubator/ajaxfetch/" + q;
        data.type = "Dashboard";
        data.language = "en"; //TODO
        console.log("BBB "+JSON.stringify(data));
        return res.render('vf_incubator', data);
      });
    } else {
      //got here by mistake
      return res.redirect("/");
    }
  });
    
  /**
   * ViewFirst fetch of Incubator
   * Must deal with issues related to leadership:
   *  buttons
   *    join quest  requires a)isLeader, and b) data,locator (transclude) and data.guildlocator
   *    leave quest requires a)isLeader and b) data.inQuest
   * @see vf_incubator.handlebars 
   */
  app.get("/incubator/ajaxfetch/:id", isPrivate, function(req, res) {
    //establish the node's identity the guild itself
    var q = req.params.id;
    myEnvironment.logDebug("GUILD LOCATOR -2 "+q); // debug establish the identity of this guild after ajax fetch
    //establish credentials
    //defaults to an empty array if no user logged in
    var credentials = [];
    var usr = req.user;
    if (usr) { credentials = usr.credentials;}
    //fetch the node itself
    Dataprovider.getNodeByLocator(q, credentials, function(err, guildnode) {
      console.log('INCUBATORrout-1 '+err+" "+guildnode);
      var data =  myEnvironment.getCoreUIData(req),
          gameTree,  metaTree;
      //Get the MillerColumn trees, both meta and game
      IncubatorModel.getMetaTree(guildnode, usr, function(err, mn) {
        if (mn) { metaTree = mn; }
        IncubatorModel.getGameTree(guildnode, usr, function(err, gn) {
          if(gn) { gameTree = gn; }
          data.metaConTree = metaTree;
          data.gameConTree = gameTree;
          //send the response
          return res.json(data);
        });               
      });
    });
  }); 
    
    
  app.get("/incubator/ajaxtreefetch/:id", isPrivate, function(req,res) {
    //establish the node's identity
		var q = req.params.id,
            guildLocator = req.query.guildLocator,
            clipboard = req.session.clipboard;
    myEnvironment.logDebug("GUILD LOCATOR -2X "+q+" "+guildLocator); // debug establish the identity of this guild after ajax fetch
		//establish credentials
		//defaults to an empty array if no user logged in
		var credentials = [];
		var usr = req.user;
		if (usr) { credentials = usr.credentials;}
		//fetch the node itself
		Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
			console.log('INCUBATORrout-1 '+err+" "+result);
			myEnvironment.logDebug("Incubator.ajaxfetch "+result.toJSON());
			var data =  myEnvironment.getCoreUIData(req),
          language = req.query.language;
      if (!language) { language = "en"; }
      var contextLocator = guildLocator;
      data.language = language;
      var title = result.getSubject(language).theText;
      data.title = "<h2 class=\"blog-post-title\"><img src="+result.getImage()+">&nbsp;"+title+"</h2>";
      var details;
      try {
        details = result.getBody(language).theText;
      } catch (e) {}
      if (!details) { details = ""; }
      data.body = details;
      var editLocator = "/incubator/edit/"+q;
      //TODO: would like to include a "Transcluded by: " user href here;
      //It's not at all clear just how to go about doing that.
      //One approach is to include a transcludeuser parameter in a rest call if this is painted
      //from a list, which means changing the signature of this method to include that.
      var tu="", 
          edithtml = "&nbsp;&nbsp;&nbsp;&nbsp;<a href=\""+editLocator+"?contextLocator="+guildLocator+"\"><b>Edit</b></a>";
      data.user = result.getLastEditDate()+"&nbsp;&nbsp;<a href=\"/user/"+
      result.getCreatorId()+"\">Created by: "+result.getCreatorId()+"</a>"+tu+edithtml;
      var clipboard = req.session.clipboard;
      if (credentials.length > 0 && clipboard && clipboard !== "") {
        //////////////////////////////////////////
        //TODO
        // These can all be moved to html templates
        //////////////////////////////////////////
				var transcludeLocator = req.session.clipboard;
				//conversationmodel must clear this when it's used.
				//THIS Button is for plain transclude4
				var htmx = "<form method=\"post\" action=\"/incubator/transclude\"  role=\"form\" class=\"form-horizontal\">";
				htmx += "<input type=\"hidden\" name=\"transcludeLocator\" value="+transcludeLocator+">";
				htmx += "<input type=\"hidden\" name=\"myLocator\" value="+q+">";
				htmx += "<input type=\"hidden\" name=\"contextLocator\" value="+contextLocator+">";
				htmx += "<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\">";
				htmx += "<button type=\"submit\" class=\"btn btn-primary\">Transclude Chosen Node</button>";
				htmx += "</div></div></form><p></p><hr>";
				data.transclude=htmx;
				//THIS Button is for transcludeAsEvidence
				htmx = "<form method=\"post\" action=\"/incubator/transcludeEvidence\"  role=\"form\" class=\"form-horizontal\">";
				htmx += "<input type=\"hidden\" name=\"transcludeLocator\" value="+transcludeLocator+">";
				htmx += "<input type=\"hidden\" name=\"myLocator\" value="+q+">";
				htmx += "<input type=\"hidden\" name=\"contextLocator\" value="+contextLocator+">";
				htmx += "<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\">";
				htmx += "<button type=\"submit\" class=\"btn btn-primary\">Transclude Chosen Node As Evidence</button>";
				htmx += "</div></div></form><p></p><hr>";
				data.transcludeevidence=htmx;
      }
			//TODO add response html here  {{#if isAuthenticated}}
      if (req.isAuthenticated()) {
				var htx = "<h2>Respond with these options...</h2>";
				htx += "<table width=\"100%\"><tbody><tr>";
				htx += "<td><center><a title=\"New Map: conversation branch\" href=\"/incubator/newMap/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/map.png\"></a></center</td>";
				htx += "<td><center><a title=\"New Question/Issue\" href=\"/incubator/newIssue/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/issue.png\"></a></center</td>";
				htx += "<td><center><a title=\"New Answer/Position\" href=\"/incubator/newPosition/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/position.png\"></a></center</td>";
				htx += "<td><center><a title=\"New Pro Argument\" href=\"/incubator/newPro/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/plus.png\"></a></center</td>";
				htx += "<td><center><a title=\"New Con Argument\" href=\"/incubator/newCon/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/minus.png\"></a></center</td>";
				htx += "</tr></tbody></table>";
				data.responsebuttons = htx;
      }

      if (clipboard === "") {
        //deal with remembering this node
        transcludehtml =
          "<form method=\"post\" action=\"/incubator/remember\"  role=\"form\" class=\"form-horizontal\">";
        transcludehtml +=
				  "<input type=\"hidden\" name=\"transcludeLocator\" value=\"\">";
        transcludehtml +=
				  "<input type=\"hidden\" name=\"myLocator\" value=\""+q+"\">";
        transcludehtml +=
				  "<input type=\"hidden\" name=\"contextLocator\" value=\""+contextLocator+"\">";
        transcludehtml +=
				  "<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\">";
        transcludehtml +=
				  "<button type=\"submit\" class=\"btn btn-info  btn-xs\" title=\"Remember for transclusion or relation\">Remember This Node</button>";
        transcludehtml += "</div></div></form>";
        data.transclude = transcludehtml;
      }

      return res.json(data);
		});
  });

  /**
   * Leave the current quest fired by a button in Incubator
   */
  app.get('/incubator/leavequest/:id', isPrivate, function(req, res) {
		var q = req.params.id;
 		//establish credentials
		//defaults to an empty array if no user logged in
		var credentials = [],
        usr = req.user;
    if (usr) { 
      credentials = usr.credentials;
      //fetch the node itself
      Dataprovider.getNodeByLocator(q, credentials, function(err, guildnode) {
        if (IncubatorModel.isLeader(guildnode, usr.handle)) {
          IncubatorModel.leaveQuest(guildnode, function(err) {
            return res.redirect("/incubator/"+q);
          });
        } else {
           return res.redirect("/incubator/"+q);
        }
      });
    } else {
      // fall through to here
      //not supposed to be here
      return res.redirect("/");
    }      
  });
   
  /**
   * Join a chosen quest fired by a button in Incubator
   */
  app.post('/incubator/joinquest', isPrivate, function(req, res) {
 	  var questLocator = req.body.locator,
        guildLocator = req.body.guildlocator,
        usx = req.user,
        error = "",
        credentials = usx.credentials,
        userLocator = usx.handle;
        req.session.clipboard = ""; //clear the clipboard
    myEnvironment.logDebug("Incubator.joinquest "+questLocator+" "+guildLocator);
    Dataprovider.getNodeByLocator(guildLocator, credentials, function(err, guildnode) {
      if (err) {error += err;}
      var isldr = IncubatorModel.isLeader(guildnode, userLocator);
      myEnvironment.logDebug("Incubator.joinquest-1 "+isldr+" "+err);
      //sanith check
      if (isldr) {
        myEnvironment.logDebug("Incubator.joinquest-2 "+questLocator);
        IncubatorModel.joinQuest(guildnode, questLocator, usx, function(err) {
          if (err) {error += err;}
          return res.redirect("/incubator/"+guildLocator);
        });
      } else {
        //TODO should redirect to 500 with error message
        return res.redirect("/");
      }  
    });
  });

  app.post("/incubator/transcludeEvidence", isPrivate, function(req, res) {
    var user = req.user,
      body = req.body,
      q = body.contextLocator;
    myEnvironment.logDebug("Incubator.postTransclude "+JSON.stringify(body));
    req.session.clipboard = ""; //clear the clipboard
    //TODO body.transcludeLocator and body.myLocator determine this transclusion
    IncubatorModel.performTransclude(body, user,"T",function(err,result) {
      return res.redirect('/incubator/'+q);
    });
  });
    
  app.post("/incubator/transclude", isPrivate, function(req, res) {
    var user = req.user,
      body = req.body,
      q = body.contextLocator;
    myEnvironment.logDebug("Incubator.postTransclude "+JSON.stringify(body));
    req.session.clipboard = ""; //clear the clipboard
    //TODO body.transcludeLocator and body.myLocator determine this transclusion
    IncubatorModel.performTransclude(body, user,"F",function(err,result) {
      return res.redirect('/incubator/'+q);
    });
  });
    
  app.post("/incubator/remember", isPrivate, function(req, res) {
    var body = req.body,
      q = body.contextLocator;
    myEnvironment.logDebug("Incubator.postRemember "+JSON.stringify(body));
    var clip = req.body.myLocator;
    if (clip) {req.session.clipboard = clip;}
    return res.redirect('/incubator/'+q);
  });
    
  /**
   * Select a Quest's GameTree node as root node for Guild gameplay
   */
  app.post('/incubator/selectrootnode', isPrivate, function(req, res) {
  	var guildLocator = req.body.guildlocator,
        rootLocator = req.body.nodelocator,
        usx = req.user,
        error = "",
        credentials = usx.credentials,
        userLocator = usx.handle;
        req.session.clipboard = ""; //clear the clipboard
    myEnvironment.logDebug("Incubator.selectrootnode "+rootLocator+" "+guildLocator);
    Dataprovider.getNodeByLocator(guildLocator, credentials, function(err, guildnode) {
      if (err) {error += err;}
      var isldr = IncubatorModel.isLeader(guildnode, userLocator);
      myEnvironment.logDebug("Incubator.selectrootnode-1 "+isldr+" "+guildnode+" "+err);
      //sanith check
      if (isldr) {
        IncubatorModel.setQuestRootNodeLocator(guildnode, rootLocator, usx, function(err) {
          if (err) {error += err;}
          return res.redirect("/incubator/"+guildLocator);
        });
      } else {
        //TODO should redirect to 500 with error message
        return res.redirect("/");
      }
            
    });
  });
    
    
  var _consupport = function(body, usx, callback) {
    var credentials = usx.credentials;
      myEnvironment.logDebug("Incubator._consupport "+IncubatorModel.getConversationModel());
    if (body.isedit === "T") {
    	IncubatorModel.update(body, usx, credentials, function(err,result) {
    		return callback(err,result);
    	});
    } else {
    	IncubatorModel.createOtherNode(body,usx,credentials, function(err,result) {
    		return callback(err,result);
    	});
    }
  };

  app.post('/incubator', isLoggedIn, function(req, res) {
    var body = req.body,
        usx = req.user;
    myEnvironment.logDebug('Incubator.post '+JSON.stringify(body));
    _consupport(body, usx, function(err, result) {
      console.log('INCUBATOR_NEW_POST-1 '+err+' '+result);
      //technically, this should return to "/" since Lucene is not ready to display
      // the new post; you have to refresh the page in any case
      return res.redirect('/incubator/'+body.contextLocator);
    });
  });

}