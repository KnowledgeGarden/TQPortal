/**
 * IncubatorApp -- the space inside a Guild where game-play occurs
 * This app is really created by GuildModel when a new Guild is created.
 * That guild then owns this incubator;
 *   its Enter button exists on the guild's landing page
 *   and is only visible when an authenticated user is a member of the guild
 */
var Incmodel = require('./guild/incubatormodel'),
    constants = require('../core/constants'),
    gameConstants = require('./rpg/gameconstants'),
    conversationConstants = require('./conversation/conversationconstants'),
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
    
 
    function isPrivate(req,res,next) {
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
    
    app.get("incubator/play/:Id", isPrivate, function(req, res) {
        
    });
    /**
     * Leave the incubator room
     */
    app.get('/incubator/leave', function(req, res) {
        //TODO anything we might want to do here
        res.redirect('/issue');
    });
    
    ///////////////////////////////////////////////////////
    // Conversation facade
    //   Provide an input into the various IBIS conversationapp features
    //   but with ability to return to the incubator
    ///////////////////////////////////////////////////////
  /**
   * Configure a conversation node form
   */
  var __getNewSomething = function(q, type, req,res) {
	var contextLocator = req.query.contextLocator;
	var data = environment.getCoreUIData(req);
	var label = "New Map Node"; //default
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
	data.isNotEdit = true;
	data.body = "";
	res.render('incubatorconversationform', data);
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
                //did user select a quest to join?
                questLocator = req.session.clipboard;
            req.session.clipboard = ""; // clear the clipboard
            myEnvironment.logDebug("GUILD LOCATOR -1 "+q); // debug establish the identity of this guild.
			credentials = usr.credentials;
            Dataprovider.getNodeByLocator(q, credentials, function(err, dx) {
                console.log("Get Incubator "+q);
                myEnvironment.logDebug("INCUBATOR "+q);
                var data =  myEnvironment.getCoreUIData(req);
                if (questLocator) {
                    data.locator = questLocator;
                    data.guildlocator = q;
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
                data.language = "en";
                console.log("BBB "+JSON.stringify(data));
                return res.render('vf_incubator', data);
            });
        } else {
            //got here by mistake
            res.redirect("/");
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
				var data =  myEnvironment.getCoreUIData(req);
				var tags = [];
				var docs=[];
				var users=[];
				var transcludes=[];
				myEnvironment.logDebug("Incubator.ajaxfetch "+JSON.stringify(data));
				CommonModel.__doAjaxFetch(guildnode, credentials, "/incubator/", tags, docs, users, transcludes, data, req, function(json, contextLocator) {
					myEnvironment.logDebug("Incubator.ajaxfetch-1 "+JSON.stringify(json));
                    //repaint the response buttons
    /**                if (req.isAuthenticated()) {
                        var htx = "<h2>Respond with these options...</h2>";
                        htx += "<table width=\"100%\"><tbody><tr>";
                        htx += "<td><center><a title=\"New Map: conversation branch\" href=\"/incubator/newMap/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/map.png\"></a></center</td>";
                        htx += "<td><center><a title=\"New Question/Issue\" href=\"/incubator/newIssue/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/issue.png\"></a></center</td>";
                        htx += "<td><center><a title=\"New Answer/Position\" href=\"/incubator/newPosition/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/position.png\"></a></center</td>";
                        htx += "<td><center><a title=\"New Pro Argument\" href=\"/incubator/newPro/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/plus.png\"></a></center</td>";
                        htx += "<td><center><a title=\"New Con Argument\" href=\"/incubator/newCon/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/minus.png\"></a></center</td>";
                        htx += "</tr></tbody></table>";
                        data.responsebuttons = htx;
                    } */

                /////////////////
                //TODO
                // Paint what is known about the quest
                /////////////////
                    var gameTree;
                    var metaTree;
                    IncubatorModel.getMetaTree(guildnode, usr, function(err, mn) {
                        if (mn) { 
                            metaTree = mn; 
                        }
                        IncubatorModel.getGameTree(guildnode, usr, function(err, gn) {
                            if(gn) {
                                gameTree = gn;
                            }
                            data.metaConTree = metaTree;
                            data.gameConTree = gameTree;
                            //send the response
                            return res.json(json);
                       });
                        
                    });
				});
			});
    }); 
    
    
      app.get("/incubator/ajaxtreefetch/:id", isPrivate, function(req,res) {
		//establish the node's identity
		var q = req.params.id,
            guildLocator = req.query.guildLocator;
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
			var data =  myEnvironment.getCoreUIData(req);
			var nodetype = result.getNodeType();
			//Fetch the tags
			var docs=[];
			var tags = [];
			if (nodetype !== types.TAG_TYPE ) {
				tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
				if (!tags) {
					tags = [];
				}
			} else {
				docs = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
				if (!docs) {
					docs = [];
				}
			}
			

			var users=[];
			var transcludes=result.listPivotsByRelationType(types.DOCUMENT_TRANSCLUDER_RELATION_TYPE);
            if (!transcludes) {
                transcludes = [];
            }
		//	myEnvironment.logDebug("Conversation.ajaxfetch "+JSON.stringify(data));
			CommonModel.__doAjaxFetch(result, credentials,"/incubator/",tags,docs,users,transcludes,data,req,function(json, contextLocator) {
				myEnvironment.logDebug("Incubator.ajaxfetch-1 "+JSON.stringify(json));
				//gather evidence
				var kids = result.listChildNodes(contextLocator);
				if (kids) {
					myEnvironment.logDebug("Incubator.ajaxfetch- "+JSON.stringify(kids));

					var evid = [];
					var x;
					var len = kids.length;
					for (var i=0;i<len;i++) {
						x = kids[i];
						if (x.isevidence) {
							evid.push(x);
						}
					}
					if (evid.length > 0) {
						json.evidence = evid;
					}
				}
                var clipboard = req.session.clipboard;
				if (credentials.length > 0 && clipboard && clipboard !== "") {
					var transcludeLocator = req.session.clipboard;
					//conversationmodel must clear this when it's used.
					//THIS Button is for plain transclude4
					var htmx = "<form method=\"post\" action=\"/conversation/transclude\"  role=\"form\" class=\"form-horizontal\">";
					htmx += "<input type=\"hidden\" name=\"transcludeLocator\" value="+transcludeLocator+">";
					htmx += "<input type=\"hidden\" name=\"myLocator\" value="+q+">";
					htmx += "<input type=\"hidden\" name=\"contextLocator\" value="+contextLocator+">";
					htmx += "<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\">";
					htmx += "<button type=\"submit\" class=\"btn btn-primary\">Transclude Chosen Node</button>";
					htmx += "</div></div></form><p></p><hr>";
					json.transclude=htmx;
					//THIS Button is for transcludeAsEvidence
					htmx = "<form method=\"post\" action=\"/conversation/transcludeEvidence\"  role=\"form\" class=\"form-horizontal\">";
					htmx += "<input type=\"hidden\" name=\"transcludeLocator\" value="+transcludeLocator+">";
					htmx += "<input type=\"hidden\" name=\"myLocator\" value="+q+">";
					htmx += "<input type=\"hidden\" name=\"contextLocator\" value="+contextLocator+">";
					htmx += "<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\">";
					htmx += "<button type=\"submit\" class=\"btn btn-primary\">Transclude Chosen Node As Evidence</button>";
					htmx += "</div></div></form><p></p><hr>";
					json.transcludeevidence=htmx;
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
					json.responsebuttons = htx;
				}
                return res.json(json);
     /*           Dataprovider.getNodeByLocator(guildLocator, credentials, function(err, guildnode) {
                    var gameTree;
                    var metaTree;
                    IncubatorModel.getMetaTree(guildnode, usr, function(err, mn) {
                        if (mn) { 
                            metaTree = mn; 
                        }
                        IncubatorModel.getGameTree(guildnode, usr, function(err, gn) {
                            if(gn) {
                                gameTree = gn;
                            }
                            data.metaConTree = metaTree;
                            data.gameConTree = gameTree;
                            //send the response
                            return res.json(json);
                       });
                        
                    });
                }); */
			});
		});
  });
    /**
     * Leave the current quest fired by a button in Incubator
     */
    app.get('incubator/leavequest', isPrivate, function(req, res) {
        //TODO
    });
   
    /**
         * Join a chosen quest fired by a button in Incubator
         */
    app.post('/incubator/joinquest', isPrivate, function(req, res) {
 	    var questLocator = req.body.locator,
            guildLocator = req.body.guildlocator,
            usx = req.user,
            error = "";
            credentials = usx.credentials,
            userLocator = usx.handle;
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

    
    app.post('/incubator/selectrootnode', isPrivate, function(req, res) {
  	    var guildLocator = req.body.guildlocator,
            rootLocator = req.body.nodelocator,
            usx = req.user,
            error = "";
            credentials = usx.credentials,
            userLocator = usx.handle;
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
    
    
  var _consupport = function(body,usx, callback) {
    var credentials = usx.credentials;
      myEnvironment.logDebug("Incubator._consupport "+IncubatorModel.getConversationModel());
    if (body.isedit === "T") {
    	IncubatorModel.getConversationModel().update(body,usx, function(err,result) {
    		return callback(err,result);
    	});
    } else if (body.locator === "") {
    	IncubatorModel.getConversationModel().createRootMap(body, usx, credentials, function(err,result) {
    		return callback(err,result);
    	});
    } else {
    	IncubatorModel.createOtherNode(body,usx,credentials, function(err,result) {
    		return callback(err,result);
    	});
    }
  };

    app.post('/incubator', isLoggedIn, function(req,res) {
        var body = req.body,
            usx = req.user;
        myEnvironment.logDebug('Incubator.post '+JSON.stringify(body));
        _consupport(body, usx, function(err, result) {
            console.log('INCUBATOR_NEW_POST-1 '+err+' '+result);
            //technically, this should return to "/" since Lucene is not ready to display
            // the new post; you have to refresh the page in any case
            return res.redirect('/incubator');
        });
    });


}