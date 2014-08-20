/**
 * conversation app
 */
var conmodel = require('./conversation/conversationmodel')
, types = require('../node_modules/tqtopicmap/lib/types')
, common = require('./common/commonmodel')
, constants = require('../core/constants');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var CommonModel = environment.getCommonModel();
	var topicMapEnvironment = environment.getTopicMapEnvironment();
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
	
  var topicMapEnvironment = environment.getTopicMapEnvironment();
  var Dataprovider = topicMapEnvironment.getDataProvider();
  var ConversationModel = new conmodel(environment);
  console.log("Conversation started");
	var self = this;
	self.canEdit = function(node, credentials) {
		console.log("BLOG.canEdit "+JSON.stringify(credentials));
		var result = false;
		if (credentials) {
			// node is deemed editable if the user created the node
			// or if user is an admin
			var cid = node.getCreatorId();
			var where = credentials.indexOf(cid);
			if (where < 0) {
				var where2 = credentials.indexOf(constants.ADMIN_CREDENTIALS);
				if (where > -1) {result = true;}
			} else {
				result = true;
			}
		}
		return result;
	};
	
  function isPrivate(req,res,next) {
    if (isPrivatePortal) {
      if (req.isAuthenticated()) {return next();}
      res.redirect('/login');
	} else {
		{return next();}
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
	// Menu
	/////////////////
	environment.addApplicationToMenu("/conversation","Conversation");
  /////////////////
  // Routes
  /////////////////
  app.get('/conversation', isPrivate, function(req,res) {
	  var data = environment.getCoreUIData(req);
	  data.start=0;
	  data.count=constants.MAX_HIT_COUNT; //pagination size
	  data.total=0;
	  data.query="/conversation/index";
	  //rendering this will cause an ajax query to blog/index
	  res.render('conversationindex',data);
  });
	
  app.get("/conversation/index", isPrivate,function(req,res) {
	  var start = parseInt(req.query.start);
	  var count = parseInt(req.query.count);
//	  var isNext = req.query.isNext.trim();
//	  topicMapEnvironment.logDebug("BLOG INDEX "+start+" "+count+" "+isNext);
	  var credentials= [];
	  if (req.user) {credentials = req.user.credentials;}

	  ConversationModel.fillDatatable(start,count, credentials, function(data, countsent,totalavailable) {
		  console.log("Conversation.index "+data);
		  var cursor;
		  //if (isNext === "T") {
			  cursor = start+countsent;
		  //} else {
		//	  cursor = start-countsent;
		 // }
		//  if (cursor < 0) {cursor = 0;}
		//  topicMapEnvironment.logDebug("BLOG INDEX2 "+start+" "+countsent+" "+isNext+" "+cursor);
		  var json = {};
		  json.start = cursor;
		  json.count = constants.MAX_HIT_COUNT; //pagination size
		  json.total = totalavailable;
		  json.table = data;
		  try {
			  res.set('Content-type', 'text/json');
		  }  catch (e) { }
	      res.json(json);
	  });
  });  
  /**
  * Start a new conversation with a Map node
  */
  app.get('/conversation/new', isLoggedIn, function(req,res) {
	  var data = myEnvironment.getCoreUIData(req);
	  data.formtitle = "New Conversation Root";
	  data.locator = "";
	  data.context = "";
	  data.nodetype = MAPTYPE;
	  data.body = "";
	  data.isNotEdit = true;
	  res.render('conversationform', data);
  });  
  //TODO THIS WORKS
  //CHANGE to a set of forms for different IBIS buttons
  //Start a new conversation with a question or a statement
  // none of the other nodes can be used.
  app.post('/conversation/new/:id', isLoggedIn, function(req,res) {
	var q = req.params.id;
	console.log("CONVERSATION_NEW "+q);
	var data =  myEnvironment.getCoreUIData(req);
//	data.formtitle = "New Conversation Root";
	data.locator = q; // becomes parentNodeLocator
	data.context = "";  
	data.nodetype = MAPTYPE;
	data.body = "";
    data.isNotEdit = true;
    console.log("FOO "+JSON.stringify(data));
    res.render('conversationform', data);
  });

  /**
   * Create a new Map to be added to the Help menu.
   * NOTE: this requires Admin credentials.
   * WARNING: it will crash if used by defaultAdmin:
   *   that "user" does not have a topic in the topic map.
   *   It must be used by a user other than defaultAdmin
   *   who has Admin credentials.
   */
  app.get('/conversation/newHelp', isPrivate, function(req,res) {
	  console.log("Conversation.newHelp");
	    var data = environment.getCoreUIData(req);
	    data.formtitle = "New Help Map";
		data.nodetype = MAPTYPE;
		data.ishelpmenu = "T";
	    data.isNotEdit = true;
		data.body = "";
	    res.render('conversationform', data);
  });

  var __getNewSomething = function(type, req,res) {
	    var q = req.params.id;
	    var contextLocator = req.query.contextLocator;
	    var data = environment.getCoreUIData(req);
	    var label = "New Map Node"; //default
	    if (type === QUESTIONTYPE) {label = "New Question/Issue Node";}
	    else if (type === ANSWERTYPE) {label = "New Answer/Position Node";}
	    else if (type === PROTYPE) {label = "New Pro Argument Node";}
	    else if (type === CONTYPE) {label = "New Con Argument Node";}
		data.formtitle = label;
		data.locator = q;
		data.nodetype = type;
		data.context = contextLocator;
	    data.isNotEdit = true;
		data.body = "";
	    res.render('conversationform', data);	    	  
  }
  app.get('/conversation/newMap/:id', isPrivate, function(req,res) {
	  __getNewSomething(MAPTYPE,req,res);
  });
  app.get('/conversation/newIssue/:id', isPrivate, function(req,res) {
	  console.log("Conversation.newIssue");
	  __getNewSomething(QUESTIONTYPE,req,res);
  });
  app.get('/conversation/newPosition/:id', isPrivate, function(req,res) {
	  __getNewSomething(ANSWERTYPE,req,res);
  });
  app.get('/conversation/newPro/:id', isPrivate, function(req,res) {
	  __getNewSomething(PROTYPE,req,res);
  });
  app.get('/conversation/newCon/:id', isPrivate, function(req,res) {
	  __getNewSomething(CONTYPE,req,res);
  });
  
  app.get('/conversation/edit/:id', isLoggedIn, function(req,res) {
		var q = req.params.id;
		var usx = req.user;
		var credentials = [];
		if (usx) {credentials = usx.credentials;}
		var data =  myEnvironment.getCoreUIData(req);
		data.formtitle = "Edit Node";
		Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
			topicMapEnvironment.logDebug("Conversation.edit "+q+" "+result);
			if (result) {
				//A blog post is an AIR
				data.title = result.getSubject(constants.ENGLISH).theText;
				data.body = result.getBody(constants.ENGLISH).theText;
				data.locator = result.getLocator();
				data.isedit = "T";
				data.isNotEdit = false;
			}
			res.render('conversationform', data); //,
		});
  });
  
  app.get("/conversation/ajaxfetch/:id", isPrivate, function(req,res) {
	    var q = req.params.id;
		var lang = req.query.language;
	    console.log('CONVERSATIONajax '+q+" "+lang);
	    var credentials = [];
	    var usr = req.user;
	    if (usr) { credentials = usr.credentials;}
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('CONVERSATIONajax-1 '+err+" "+result);
	      var data = myEnvironment.getCoreUIData(req);
	  	

			    var contextLocator;
			    if (req.query.contextLocator) {
			    	contextLocator = req.query.contextLocator;
			    } else {
			    	//if it's a map node, use that
			    	if (result.getNodeType() == types.CONVERSATION_MAP_TYPE) {
			    		contextLocator = result.getLocator();
			    	}
			    	//TODO
			    	//Otherwise, grab some context from the node
			    }
			    topicMapEnvironment.logDebug("Conversation.ajaxfetch "+q+" "+contextLocator+" "+req.query.contextLocator);
			    
		    	  var canEdit = self.canEdit(result,credentials);
		    	  var clipboard = req.session.clipboard;
		    	  
		    	  var editLocator = "/conversation/edit/"+result.getLocator();
		    	  

			      var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
			      if (!tags) {
			    	  tags = [];
			      }

	      CommonModel.generateViewFirstData(result, tags, [],[],credentials, canEdit, data, contextLocator, "/conversation/", clipboard, lang, function(json) {
	    	  if (credentials.length > 0 && req.session.clipboard !="") {
	    		  var transcludeLocator = req.session.clipboard;
	    		  //conversationmodel must clear this when it's used.
	    		  var htmx = "<form method=\"post\" action=\"/conversation/transclude\"  role=\"form\" class=\"form-horizontal\">";
	    		  htmx += "<input type=\"hidden\" name=\"transcludeLocator\" value="+transcludeLocator+">";
	    		  htmx += "<input type=\"hidden\" name=\"myLocator\" value="+q+">";
	    		  htmx += "<input type=\"hidden\" name=\"contextLocator\" value="+contextLocator+">";
	    		  htmx += "<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\">";
	    		  htmx += "<button type=\"submit\" class=\"btn btn-primary\">Transclude Chosen Node</button>";
	    		  htmx += "</div></div></form><p></p><hr>";
	    		  json.transclude=htmx;
	    	  }

	    	  
	    	  //TODO add response html here  {{#if isAuthenticated}}
		      if (credentials.length > 0) {
		    	  var htx = "<h2>Respond with these options...</h2>";
		    	  htx += "<table width=\"100%\"><tbody><tr>";
		    	  htx += "<td><center><a title=\"New Map: conversation branch\" href=\"/conversation/newMap/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/map.png\"></a></center</td>";
		    	  htx += "<td><center><a title=\"New Question/Issue\" href=\"/conversation/newIssue/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/issue.png\"></a></center</td>";
		    	  htx += "<td><center><a title=\"New Answer/Position\" href=\"/conversation/newPosition/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/position.png\"></a></center</td>";
		    	  htx += "<td><center><a title=\"New Pro Argument\" href=\"/conversation/newPro/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/plus.png\"></a></center</td>";
		    	  htx += "<td><center><a title=\"New Con Argument\" href=\"/conversation/newCon/"+q+"?contextLocator="+contextLocator+"\"><img src=\"/images/ibis/minus.png\"></a></center</td>";
		    	  htx += "</tr></tbody></table>";
		    	  json.responsebuttons = htx;
		      }
			  //get all parents
			  CommonModel.fillConversationTable(true, true,q,"",credentials,function(err,cresult) {
				  if (cresult) {
					  json.ccontable = cresult;
				  }
				  //get just my parents in particular context
				  CommonModel.fillConversationTable(true, false,q,contextLocator,credentials,function(err,presult) {
					  if (presult) {
						  json.pcontable = presult;
					  }
					 
				      console.log("XOXOX "+JSON.stringify(json));
				      	
				        try {
				            res.set('Content-type', 'text/json');
				          }  catch (e) { }
				          res.json(json);
				  });

			  });

	    	  
	      });
	    });
	      
  });
  app.get('/conversation/:id', isPrivate,function(req,res) {
	    var q = req.params.id;
	    topicMapEnvironment.logDebug('CONVERSATIONrout '+q);
	    var data = myEnvironment.getCoreUIData(req);
	    data.query = "/conversation/ajaxfetch/"+q;
	    data.language = "en";
	    data.type = "foo";
	    if (req.query.contextLocator) {
	    	data.contextLocator = req.query.contextLocator;
	    }
	    res.render('vf_conversationnode', data);
  });


  /**
   * Function which ties the app-embedded route back to here
   */
  var _consupport = function(body,usx, callback) {
    var credentials = usx.credentials;
    if (body.ishelpmenu == "T") {
    	ConversationModel.createHelpMap(body,usx,credentials, function(err,result) {
    		callback(err,result);
    	});
    } else if (body.isedit === "T") {
    	ConversationModel.update(body,usx, function(err,result) {
    		callback(err,result);
    	});
    } else if (body.locator === "") {
    	ConversationModel.createRootMap(body, usx, credentials, function(err,result) {
    		callback(err,result);
    	});
    } else {
    	ConversationModel.createOtherNode(body,usx,credentials, function(err,result) {
    		callback(err,result);
    	});
    }
  };
    
  var _newsomething = function(body,usx, what, parentLocator, callback) {
	var credentials = [];
	if (usx) {credentials = usx.credentials;}
	ConversationModel.createMap(body, usx, credentials, function(err,result) {
		callback(err,result);
	});
  };

  app.post('/conversation', isLoggedIn, function(req,res) {
    var body = req.body;
    var usx = req.user;
    topicMapEnvironment.logDebug('CONVERSATION_NEW_POST '+JSON.stringify(body));
    _consupport(body, usx, function(err,result) {
      console.log('CONVERSATION_NEW_POST-1 '+err+' '+result);
      //technically, this should return to "/" since Lucene is not ready to display
      // the new post; you have to refresh the page in any case
      return res.redirect('/conversation');
    });
  });
  
  
  app.post('/conversation/remember', isLoggedIn, function(req,res) {
	var body = req.body;
	topicMapEnvironment.logDebug("Conversation.postRemember "+JSON.stringify(body));
	var clip = req.body.myLocator;
	if (clip) {req.session.clipboard = clip;}
	return res.redirect('/conversation');
  });
  
  app.post('/conversation/transclude', isLoggedIn, function(req,res) {
	var credentials = req.user.credentials;
	var body = req.body;
	topicMapEnvironment.logDebug("Conversation.postTransclude "+JSON.stringify(body));
	req.session.clipboard = ""; //clear the clipboard
	//TODO body.transcludeLocator and body.myLocator determine this transclusion
	ConversationModel.performTransclude(body, credentials,function(err,result) {
		return res.redirect('/conversation');
	});
  });
};