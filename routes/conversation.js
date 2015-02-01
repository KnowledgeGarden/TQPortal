/**
 * conversation app
 */
var Conmodel = require('../apps/conversation/conversationmodel'),
    types = require('tqtopicmap/lib/types'),
    common = require('../apps/common/commonmodel'),
    conversationConstants = require('../apps/conversation/conversationconstants'),
    constants = require('../core/constants');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        CommonModel = environment.getCommonModel(),
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        ConversationModel = new Conmodel(environment),
        self = this;
	console.log("Conversation started");
	

	
	function isPrivate(req,res,next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {
				return next();
			} else {
      			return res.redirect('/login');
  			}
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
		} else {
			myEnvironment.logDebug("YOU GOT HERE");
			return res.redirect('/');
		}
	}
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/conversation","Conversation");
	/////////////////
	// Routes
	/////////////////
 	app.get('/conversation', isPrivate, function conversationGetCon(req, res) {
		var data = environment.getCoreUIData(req);
		data.start=0;
		data.count=constants.MAX_HIT_COUNT; //pagination size
		data.total=0;
		data.query="/conversation/index";
		//rendering this will cause an ajax query to blog/index
		return res.render('conversationindex',data);
 	});
	
	app.get("/conversation/index", isPrivate,function conversationGetIndex(req, res) {
		var start = parseInt(req.query.start),
			count = parseInt(req.query.count),
			 credentials= [];
		if (req.user) {credentials = req.user.credentials;}

		ConversationModel.fillDatatable(start,count, credentials, function conversationFillDatatable(data, countsent, totalavailable) {
			console.log("Conversation.index "+data);
			var cursor = start+countsent;
			var json = {};
			json.start = cursor;
			json.count = constants.MAX_HIT_COUNT; //pagination size
			json.total = totalavailable;
			json.table = data;
			return res.json(json);
		});
	});
  
	/**
	 * Start a new conversation with a Map node
	 */
	app.get('/conversation/new', isLoggedIn, function conversationGetNew(req, res) {
		var data = myEnvironment.getCoreUIData(req);
		data.formtitle = "New Conversation Root";
		data.locator = "";
		data.context = "";
		data.nodetype = conversationConstants.MAPTYPE;
		data.body = "";
		data.isNotEdit = true;
		return res.render('conversationform', data);
	});
  
	//TODO THIS WORKS
	//CHANGE to a set of forms for different IBIS buttons
	//Start a new conversation with a question or a statement
	// none of the other nodes can be used.
	app.post('/conversation/new/:id', isLoggedIn, function conversationPostNew(req, res) {
		var q = req.params.id;
		console.log("CONVERSATION_NEW "+q);
		var data =  myEnvironment.getCoreUIData(req);
	//	data.formtitle = "New Conversation Root";
		data.locator = q; // becomes parentNodeLocator
		data.context = "";
		data.nodetype = conversationConstants.MAPTYPE;
		data.body = "";
		data.isNotEdit = true;
		console.log("FOO "+JSON.stringify(data));
		return res.render('conversationform', data);
 	});

	/**
 	 * Create a new Map to be added to the Help menu.
 	 * NOTE: this requires Admin credentials.
 	 * WARNING: it will crash if used by defaultAdmin:
 	 *   that "user" does not have a topic in the topic map.
 	 *   It must be used by a user other than defaultAdmin
 	 *   who has Admin credentials.
 	 */
	app.get('/conversation/newHelp', isPrivate, function conversationGetNewHelp(req, res) {
		console.log("Conversation.newHelp");
		var data = environment.getCoreUIData(req);
		data.formtitle = "New Help Map";
		data.nodetype = conversationConstants.MAPTYPE;
		data.ishelpmenu = "T";
		data.isNotEdit = true;
		data.body = "";
		return res.render('conversationform', data);
	});

	//////////////////////////////////
	//Conversation manipulation is made complex due to the
	// several kinds of conversation nodes
	//////////////////////////////////
  
	/**
	 * Configure a conversation node form
	 */
	var __getNewSomething = function conversationGetNewSomething(type, req, res) {
		var q = req.params.id,
			contextLocator = req.query.contextLocator,
			data = environment.getCoreUIData(req),
			label = "New Map Node"; //default
		if (type === conversationConstants.QUESTIONTYPE) {label = "New Question/Issue Node";}
		else if (type === conversationConstants.ANSWERTYPE) {label = "New Answer/Position Node";}
		else if (type === conversationConstants.PROTYPE) {label = "New Pro Argument Node";}
		else if (type === conversationConstants.CONTYPE) {label = "New Con Argument Node";}
		//otherwise, default
		data.formtitle = label;
		data.locator = q;
		data.nodetype = type;
		data.context = contextLocator;
		data.isNotEdit = true;
		data.body = "";
		return res.render('conversationform', data);
	};
  
	app.get('/conversation/newMap/:id', isPrivate, function conversationGetNewMap(req, res) {
		__getNewSomething(conversationConstants.MAPTYPE,req,res);
	});
	app.get('/conversation/newIssue/:id', isPrivate, function conversationGetNewIssue(req, res) {
		console.log("Conversation.newIssue");
		__getNewSomething(conversationConstants.QUESTIONTYPE,req,res);
	});
	app.get('/conversation/newPosition/:id', isPrivate, function conversationGetNewPosition(req, res) {
		__getNewSomething(conversationConstants.ANSWERTYPE,req,res);
	});
	app.get('/conversation/newPro/:id', isPrivate, function conversationGetNewPro(req, res) {
		__getNewSomething(conversationConstants.PROTYPE,req,res);
	});
	app.get('/conversation/newCon/:id', isPrivate, function conversationGetNewCon(req, res) {
		__getNewSomething(conversationConstants.CONTYPE,req,res);
	});
  
	app.get('/conversation/edit/:id', isLoggedIn, function conversationGetEdit(req, res) {
		var q = req.params.id,
			usx = req.user,
			credentials = [];
		if (usx) {credentials = usx.credentials;}
		var data =  myEnvironment.getCoreUIData(req);
		data.formtitle = "Edit Node";
		Dataprovider.getNodeByLocator(q, credentials, function conversationGetNode(err, result) {
			myEnvironment.logDebug("Conversation.edit "+q+" "+result);
			if (result) {
				//This node is an AIR
				data.title = result.getSubject(constants.ENGLISH).theText;
				if (result.getBody(constants.ENGLISH)) {
					data.body = result.getBody(constants.ENGLISH).theText;
				}
				data.locator = result.getLocator();
				data.isedit = "T";
				data.isNotEdit = false;
			}
			return res.render('conversationform', data);
		});
	});
  
	app.get("/conversation/ajaxfetch/:id", isPrivate, function conversationGetAjax(req, res) {
		//establish the node's identity
		var q = req.params.id;
		//establish credentials
		//defaults to an empty array if no user logged in
		var credentials = [];
		var usr = req.user;
		if (usr) { credentials = usr.credentials;}
		//fetch the node itself
		Dataprovider.getNodeByLocator(q, credentials, function conversationGetNode1(err, result) {
			console.log('CONVERSATIONrout-1 '+err+" "+result);
			var data =  myEnvironment.getCoreUIData(req);
			if (result) {
				myEnvironment.logDebug("Conversation.ajaxfetch- "+result.toJSON());
				topicMapEnvironment.logDebug("Conversation.ajaxfetch- "+JSON.stringify(credentials)+" | "+result.toJSON());
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
				//Tell the view that it will start a new conversation with a MAPTYPE node
				//NOTE: this could change: we might actually install that map when the node is built
			//	data.newnodetype = conversationConstants.MAPTYPE;
				myEnvironment.logDebug("Conversation.ajaxfetch-1 "+JSON.stringify(data));
				CommonModel.__doAjaxFetch(result, credentials, "/conversation/", tags, docs, users, transcludes, data, req, function conversationDoAjax(json, contextLocator) {
					myEnvironment.logDebug("Conversation.ajaxfetch-2 "+JSON.stringify(json));
					//gather evidence
					var kids = result.listChildNodes(contextLocator);
					if (kids) {
						myEnvironment.logDebug("Conversation.ajaxfetch-3 "+JSON.stringify(kids));

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
					myEnvironment.logDebug("Conversation.ajaxfetch+ "+JSON.stringify(json));
					//send the response
					return res.json(json);
				});
			} else {
				return res.redirect('/error/UnableToDisplay'); 
			}
		});
	});
  
  
	app.get('/conversation/:id', isPrivate,function conversationGet(req, res) {
		var q = req.params.id,
		data = myEnvironment.getCoreUIData(req);
		myEnvironment.logDebug("CONVERSATIONY "+JSON.stringify(req.query));
		CommonModel.__doGet(q,"/conversation/", data, req, function conversationDoGet(viewspec, data) {
			if (viewspec === "Dashboard") {
				return res.render('vf_conversationnode', data);
			} else {
				return res.render('vfcn_conversationnode',data);
			}
		});
	});


	/**
	 * Function which ties the app-embedded route back to here
	 */
	var _consupport = function(body, usx, callback) {
		var credentials = usx.credentials;

		if (body.ishelpmenu === "T") {
			ConversationModel.createHelpMap(body,usx,credentials, function conversationCreateHelpMap(err, result) {
    			return callback(err, result);
    		});
		} else if (body.isedit === "T") {
			ConversationModel.update(body, usx, function conversationUpdate(err, result) {
				return callback(err, result);
			});
		} else if (body.locator === "") {
			ConversationModel.createRootMap(body, usx, credentials, function conversationCreateRootMap(err, result) {
				return callback(err, result);
			});
		} else {
			ConversationModel.createOtherNode(body, usx, credentials, function conversationCreateOther(err, result) {
				return callback(err, result);
			});
		}
	};
    
	var _newsomething = function(body, usx, what, parentLocator, callback) {
		var credentials = [];
		if (usx) {credentials = usx.credentials;}
		ConversationModel.createMap(body, usx, credentials, function conversationCreateMap(err,result) {
			callback(err, result);
		});
	};

	app.post('/conversation', isLoggedIn, function conversationPost(req, res) {
		var body = req.body,
			usx = req.user;
		myEnvironment.logDebug('CONVERSATION_NEW_POST '+JSON.stringify(body));
		_consupport(body, usx, function conversation_Consupport(err, result) {
			console.log('CONVERSATION_NEW_POST-1 '+err+' '+result);
			//technically, this should return to "/" since Lucene is not ready to display
			// the new post; you have to refresh the page in any case
			return res.redirect('/conversation');
		});
	});
  
  
	app.post('/conversation/remember', isLoggedIn, function conversationPostRemember(req, res) {
		var body = req.body;
		myEnvironment.logDebug("Conversation.postRemember "+JSON.stringify(body));
		var clip = req.body.myLocator;
		if (clip) {req.session.clipboard = clip;}
		return res.redirect('/conversation');
	});
  
	app.post('/conversation/transclude', isLoggedIn, function conversationPostTransclude(req, res) {
		var user = req.user,
			body = req.body;
		myEnvironment.logDebug("Conversation.postTransclude "+JSON.stringify(body));
		req.session.clipboard = ""; //clear the clipboard
		//TODO body.transcludeLocator and body.myLocator determine this transclusion
		ConversationModel.performTransclude(body, user,"F",function conversationPerformTransclude(err,result) {
			return res.redirect('/conversation');
		});
  	});
  
	app.post('/conversation/transcludeEvidence', isLoggedIn, function conversationPostEvidence(req, res) {
		var user = req.user,
			body = req.body;
		myEnvironment.logDebug("Conversation.postTransclude "+JSON.stringify(body));
		req.session.clipboard = ""; //clear the clipboard
		//TODO body.transcludeLocator and body.myLocator determine this transclusion
		ConversationModel.performTransclude(body, user, "T", function conversationPerformeEvidence(err, result) {
			return res.redirect('/conversation');
		});
	});
};