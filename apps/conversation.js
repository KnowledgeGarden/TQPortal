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
    res.render('conversationindex',environment.getCoreUIData(req));
  });

  /**
   * Start a new conversation with a Map node
   */
  app.get('/conversation/new', isLoggedIn, function(req,res) {
		var data =  myEnvironment.getCoreUIData(req);
		data.formtitle = "New Conversation Root";
		data.locator = "";
		data.context = "";
		data.nodetype = MAPTYPE;
		data.body = "";

	    data.isNotEdit = true;
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
				data.isNotEdit = false;
			}
			res.render('conversationform', data); //,
		});
  });

  app.get('/conversation/:id', isPrivate,function(req,res) {
	    var q = req.params.id;
	    //passed in by ?context="..."
	    var credentials = [];
	    var usr = req.user;
	    if (usr) { credentials = usr.credentials;}
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('CONVERSATIonrout-1 '+err+" "+result.toJSON());
	      //This stuff about contextLocator is crucial
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
		    topicMapEnvironment.logDebug("Conversation.getConversation "+q+" | "+contextLocator);
	      var title = result.getSubject(constants.ENGLISH).theText;
	      var details = "";
	      if (result.getBody(constants.ENGLISH)) {
	    	  details = result.getBody(constants.ENGLISH).theText;
	      }
	      var userid = result.getCreatorId();
	      // paint tags
	      var tags = result.listRelationsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
	      console.log("Conversation.XXX "+JSON.stringify(tags));
	     
	      var date = result.getLastEditDate();
	      var data = environment.getCoreUIData(req);
    	  var canEdit = self.canEdit(result,credentials);
    	  data.canEdit = canEdit;
    	  data.isNotEdit = true;
    	  data.editLocator = "/conversation/edit/"+result.getLocator();
	      data.title = title;
	      data.body = details;
	      data.tags = tags;
	      data.source = result.toJSON();
	      if (contextLocator) {
	    	  data.contextLocator = contextLocator;
	    	  //TODO this must be used in the transclude button
	      }
	      data.date = date;
	      data.user = userid;
	      data.image = result.getImage();
    	  data.myLocator = q;
    	  data.myLocatorXP = q+"?contextLocator="+contextLocator;
    	  //This is to transclude any selected node as a child node on this node
	      if (credentials.length > 0 && req.session.clipboard === "") {
	    	  data.transclude = "yes";
	      } else {
	    	  data.transcludeLocator = req.session.clipboard;
	    	  //conversationmodel must clear this when it's used.
	      }
	      console.log('CONVERSATIonrout-2 '+JSON.stringify(data));
	      res.render('conversationnode', data);
	    });
	  });
  
  app.get('/conversation/ajaxtopicnode/:id', function(req, res) {
	    var q = req.params.id;
	    console.log('AJAXCONNODE '+q);
	    var credentials = [];
	    if (req.user) { credentials = req.user.credentials;}
	    //get all parents
	    CommonModel.fillConversationTable(true, true,q,"",credentials,function(err,result) {
	        try {
	            res.set('Content-type', 'text/json');
	          }  catch (e) { }
	          res.json(result);

	    });

  });
  
  app.get('/conversation/ajaxptopicnode/:id', function(req, res) {
	    var q = req.params.id;
	    console.log('AJAXTOPICNODE '+q);
	    var credentials = [];
	    if (req.user) { credentials = req.user.credentials;}
	    var contxt = req.query.contextLocator;
	    //get just my parents in particular context
	    CommonModel.fillConversationTable(true, false,q,contxt,credentials,function(err,result) {
	        try {
	            res.set('Content-type', 'text/json');
	          }  catch (e) { }
	          res.json(result);

	    });
 });

  /**
   * Function which ties the app-embedded route back to here
   */
  var _consupport = function(body,usx, callback) {
    var credentials = usx.credentials;
    if (body.locator === "") {
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
  
  //TODO THIS WORKS
  //CHANGE to a set of forms for different IBIS buttons
  //Start a new conversation with a question or a statement
  // none of the other nodes can be used.
  app.post('/conversation/new/:id', isLoggedIn, function(req,res) {
	var q = req.params.id;
	console.log("CONVERSATION_NEW "+q);
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "New Conversation Root";
	data.locator = q;
	data.context = "";
	data.nodetype = MAPTYPE;
	data.body = "";

    data.isNotEdit = true;
    res.render('conversationform', data);
	

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