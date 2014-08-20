/**
 * Wiki app
 */
var wm = require('./wiki/wikimodel')
 , types = require('../node_modules/tqtopicmap/lib/types')
, common = require('./common/commonmodel')
  , constants = require('../core/constants')
;

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var CommonModel = environment.getCommonModel();
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
    var WikiModel = new wm(environment);
	var MAPTYPE = "1";

  console.log("Starting Wiki "+WikiModel);
	var self = this;
	self.canEdit = function(node, credentials) {
		console.log("Wiki.canEdit "+JSON.stringify(credentials));
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
			console.log("Wiki.canEdit_ "+cid+" "+where+" "+result);
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
	environment.addApplicationToMenu("/wiki","Wiki");
  /////////////////
  // Routes
  /////////////////
  app.get('/wiki', isPrivate,function(req,res) {
	  var credentials= [];
	  if (req.user) {credentials = req.user.credentials;}
	  var data = environment.getCoreUIData(req);
	  data.start=0;
	  data.count=constants.MAX_HIT_COUNT; //pagination size
	  data.total=0;
	  data.query="/wiki/index";
	  //rendering this will cause an ajax query to blog/index
	  res.render('wikihome',data);
  });
	
  app.get("/wiki/index", isPrivate,function(req,res) {
	  var start = parseInt(req.query.start);
	  var count = parseInt(req.query.count);
	  var credentials= [];
	  if (req.user) {credentials = req.user.credentials;}

	  WikiModel.fillDatatable(start,count, credentials, function(data, countsent,totalavailable) {
		  console.log("Wiki.index "+data);
		  var  cursor = start+countsent;
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
  app.get('/wiki/edit/:id', isLoggedIn, function(req,res) {
	var q = req.params.id;
	var usx = req.user;
    var credentials = [];
	if (usx) {credentials = usx.credentials;}
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "Edit Topic";
	Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
		topicMapEnvironment.logDebug("WIKI.edit "+q+" "+result);
		if (result) {
			//A blog post is an AIR
			data.title = result.getSubject(constants.ENGLISH).theText;
			data.body = result.getBody(constants.ENGLISH).theText;
			data.locator = result.getLocator();
			data.isNotEdit = false;
		}
		res.render('wikiform', data); //,
	});
  });
  
  app.get("/wiki/ajaxfetch/:id", isPrivate, function(req,res) {
	    var q = req.params.id;
		var lang = req.query.language;
	    console.log('WIKIajax '+q+" "+lang);
	    var credentials = [];
	    var usr = req.user;
	    if (usr) { credentials = usr.credentials;}
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('WIKIrout-1 '+err+" "+result);
	      var data = myEnvironment.getCoreUIData(req);
			    var contextLocator;
			    if (req.query.contextLocator) {
			    	contextLocator = req.query.contextLocator;
			    } else {
			    	//if it's a map node, use that
			    	if (result.getNodeType() == types.CONVERSATION_MAP_TYPE) {
			    		contextLocator = result.getLocator();
			    	} else {
			    		contextLocator = q;
			    	}
			    	//TODO
			    	//Otherwise, grab some context from the node
			    }
		    	  var canEdit = self.canEdit(result,credentials);
		    	  var clipboard = req.session.clipboard;
		    	  
		    	  var editLocator = "/wiki/edit/"+result.getLocator();
		    	  

			      var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
			      if (!tags) {
			    	  tags = [];
			      }

	      CommonModel.generateViewFirstData(result, tags, [],[],credentials, canEdit, data, contextLocator, "/wiki/", clipboard, lang, function(json) {
	    	  json.myLocatorXP = q+"?contextLocator="+contextLocator;
	    	  json.myLocator = q;
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
				      json.newnodetype = MAPTYPE;

				      console.log("XXXX "+JSON.stringify(json));
				      	
				        try {
				            res.set('Content-type', 'text/json');
				          }  catch (e) { }
				          res.json(json);
				  });

			  });
	    	  
	      });
	    });
	      
  });
  
  /**
   * Fill ViewFirst
   */
  app.get('/wiki/:id', isPrivate,function(req,res) {
	    var q = req.params.id;
	    console.log('BLOGrout '+q);
	    var data = myEnvironment.getCoreUIData(req);
	    data.query = "/wiki/ajaxfetch/"+q;
	    data.language = "en";
	    data.type = "foo";
	    if (req.query.contextLocator) {
	    	data.contextLocator = req.query.contextLocator;
	    }
	    res.render('vf_topic', data);
  });

  
  app.get('/wiki/edit/:id', isLoggedIn, function(req,res) {
		var q = req.params.id;
		var usx = req.user;
		var credentials = [];
		if (usx) {credentials = usx.credentials;}
		var data =  myEnvironment.getCoreUIData(req);
		data.formtitle = "Edit Topic";
		Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
			topicMapEnvironment.logDebug("Wiki.edit "+q+" "+result);
			if (result) {
				//A blog post is an AIR
				data.title = result.getSubject(constants.ENGLISH).theText;
				data.body = result.getBody(constants.ENGLISH).theText;
				data.locator = result.getLocator();
				data.isNotEdit = false;
			}
			res.render('wikiform', data); //,
		});
	  });

  app.post('/newtopic', isLoggedIn, function(req,res) {
	var title = req.body.title;
	console.log("Wiki.newtopic "+title);
	  var data =  myEnvironment.getCoreUIData(req);
	  data.formtitle = "New Topic";
	  data.title = title;
	    data.isNotEdit = true;
	res.render('wikiform', data);
  });
  
  /**
   * Function which ties the app-embedded route back to here
   */
  var __wikisupport = function(body,usx, callback) {
//	  console.log("WIKIXXX "+JSON.stringify(body));
	    if (body.locator === "") {
    WikiModel.create(body, usx, function(err,result) {
      callback(err,result);
    });
	    } else {
	    	var credentials = usx.credentials;
	    	
	        WikiModel.update(body, usx, function(err,result) {
	            callback(err,result);
	          });
	    	
	    }
  };

  app.post('/wiki', isLoggedIn, function(req,res) {
	  var body = req.body;
	  var usx = req.user;
	  console.log('WIKI_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
	  __wikisupport(body, usx, function(err,result) {
	      console.log('WIKI_NEW_POST-1 '+err+' '+result);
	      //technically, this should return to "/" since Lucene is not ready to display
	      // the new post; you have to refresh the page in any case
	      return res.redirect('/wiki');
	    });
	  
  });
};