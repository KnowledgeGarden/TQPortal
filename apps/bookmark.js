/**
 * Bookmark app
 * javascript:location.href='http://<serverurl>/bookmark/new?url='+           
 *   encodeURIComponent(location.href)+'&title='+         
 *   encodeURIComponent(document.title)
 */
var bkmrk = require('./bookmark/bookmarkmodel')
//  , colnavwidget = require('./widgets/jquerycolnav')
  , constants = require('../core/constants')
  , types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var CommonModel = environment.getCommonModel();
	var Dataprovider = topicMapEnvironment.getDataProvider();
//	var ColNavWidget = new colnavwidget(environment,Dataprovider);
    var BookmarkModel = new bkmrk(environment);
	var MAPTYPE = "1";

  console.log("Starting Bookmark "+BookmarkModel);
	var self = this;
	self.canEdit = function(node, credentials) {
		console.log("BOOKMARK.canEdit "+JSON.stringify(credentials));
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
  function __get(req) {
	  return environment.getCoreUIData(req);
  }

	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/bookmark","Bookmark");

	/////////////////
	// Routes
	/////////////////
  app.get('/bookmark', isPrivate, function(req,res) {
	  var data = environment.getCoreUIData(req);
	  data.start=0;
	  data.count=constants.MAX_HIT_COUNT; //pagination size
	  data.total=0;
	  data.query="/bookmark/index";
	  //rendering this will cause an ajax query to blog/index
	  res.render('bookmarkindex',data);
  });
	
  app.get("/bookmark/index", isPrivate,function(req,res) {
	  var start = parseInt(req.query.start);
	  var count = parseInt(req.query.count);
	  var credentials= [];
	  if (req.user) {credentials = req.user.credentials;}

	  BookmarkModel.fillDatatable(start,count, credentials, function(data, countsent,totalavailable) {
		  console.log("Bookmark.index "+data);
		  var cursor = start+countsent;
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
  app.get('/bookmark/new', isLoggedIn, function(req,res) {
	  //console.log("BOOKMARKNEW "+JSON.stringify(req.query));
	  //BOOKMARKNEW {"url":"http://localhost:3000/","title":"TopicQuests Foundation"}
	  var query = req.query;
		var data =  __get(req);
		data.formtitle = "New Bookmark";
		data.url = query.url;
		data.title = query.title;
	    data.isNotEdit = true;
		res.render('bookmarkform',data);
  });
  
  /**
   * Fire up the blog edit form on a given node
   */
  app.get('/bookmark/edit/:id', isLoggedIn, function(req,res) {
	var q = req.params.id;
	var usx = req.user;
	var credentials = [];
	if (usx) {credentials = usx.credentials;}
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "Edit Bookmark";
	Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
		myEnvironment.logDebug("BookMark.edit "+q+" "+result);
		if (result) {
			//A blog post is an AIR
			data.title = result.getSubject(constants.ENGLISH).theText;
			if (result.getBody(constants.ENGLISH)) {
				data.body = result.getBody(constants.ENGLISH).theText;
			}
			data.locator = result.getLocator();
			data.isNotEdit = false;
		}
		res.render('bookmarkeditform', data); //,
	});
  });
  

  app.get("/bookmark/ajaxfetch/:id", isPrivate, function(req,res) {
		//establish the node's identity
		var q = req.params.id;
		//establish credentials
		//defaults to an empty array if no user logged in
		var credentials = [];
		var usr = req.user;
		if (usr) { credentials = usr.credentials;}
		//fetch the node itself
		Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
			console.log('BOOKMARKrout-1 '+err+" "+result);
			var data =  myEnvironment.getCoreUIData(req);
			//Fetch the tags
			var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
			if (!tags) {
				tags = [];
			}
			var docs=[];
			var users=[];
			var transcludes=[];
			//Tell the view that it will start a new conversation with a MAPTYPE node
			//NOTE: this could change: we might actually install that map when the node is built
			data.newnodetype = MAPTYPE;
			myEnvironment.logDebug("Bookmark.ajaxfetch "+JSON.stringify(data));
			CommonModel.__doAjaxFetch(result, credentials,"/bookmark/",tags,docs,users,transcludes,data,req,function(json) {
				myEnvironment.logDebug("Bookmark.ajaxfetch-1 "+JSON.stringify(json));
					//send the response
					try {
						res.set('Content-type', 'text/json');
					}  catch (e) { }
					res.json(json);
			} );
		});
/**	    var q = req.params.id;
		var lang = req.query.language;
		if (!lang) {
			lang = "en";
		}
		var viewspec = req.query.viewspec;
		var rootLocator = req.query.rootLocator;
		if (!viewspec) {
			viewspec = "Dashboard";
		}
	    console.log('Bookmarkajax '+q+" "+lang);
	    var credentials = [];
	    var usr = req.user;
	    if (usr) { credentials = usr.credentials;}
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('Bookmarkrout-1 '+err+" "+result);
	      var data = myEnvironment.getCoreUIData(req);
			    var contextLocator;
			    if (req.query.contextLocator) {
			    	contextLocator = req.query.contextLocator;
			    } else {
			    	//if it's a map node, use that
			    	if (result.getNodeType() == types.CONVERSATION_MAP_TYPE) {
			    		contextLocator = result.getLocator();
			    	} else {
			    		//This is a bookmark; it can be its own context
			    		//but that's not good enough; we'll punt for now
			    		contextLocator = q;
			    	}
			    }
			    myEnvironment.logDebug("Bookmark.ajaxfetch "+q+" "+contextLocator);
		    	  var canEdit = self.canEdit(result,credentials);
		    	  var clipboard = req.session.clipboard;
		    	  
		    	  var editLocator = "/bookmark/edit/"+result.getLocator();
		    	  

			      var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
			      if (!tags) {
			    	  tags = [];
			      }
			      var transcludeUser = "";  //TODO
	      CommonModel.generateViewFirstData(result, tags, [],[],credentials, canEdit, data, contextLocator, "/bookmark/", clipboard, lang, transcludeUser,viewspec,function(json) {
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
					  if (viewspec === "ColNav") {
				    	  if (!rootLocator) {rootLocator = q;}
				    	  var colnav = ColNavWidget.makeColNav(rootLocator,result,contextLocator,lang, credentials, function(err,html) {
				    		  json.colnav = html;
				//		      console.log("XXXX "+JSON.stringify(json));
						      	
						        try {
						            res.set('Content-type', 'text/json');
						          }  catch (e) { }
						          res.json(json);
				    	  });

					  } else {
				//      console.log("YYYY "+JSON.stringify(json));
				      	
				        try {
				            res.set('Content-type', 'text/json');
				          }  catch (e) { }
				          res.json(json);
					  }				  });

			  });
	      });
	    });
	  */    
  });
  
  /**
   * Fill ViewFirst
   */
  app.get('/bookmark/:id', isPrivate,function(req,res) {
	var q = req.params.id;
	var data = myEnvironment.getCoreUIData(req);
	myEnvironment.logDebug("BOOKMARKY "+JSON.stringify(req.query));
	CommonModel.__doGet(q,"/bookmark/",data, req, function(viewspec, data) {
	if (viewspec === "Dashboard") {
		return res.render('vf_topic', data);
		} else {
			return res.render('vfcn_topic',data);
		}
	});
  });

  var _bookmarksupport = function(body,usx, callback) {
	var credentials = usx.credentials;
	if (body.locator === "") {
		BookmarkModel.create(body, usx, credentials, function(err,result) {
			callback(err,result);
		});
	} else {
		BookmarkModel.update(body, usx, function(err,result) {
			callback(err,result);
		});
	}
  };

  app.post('/bookmark', isLoggedIn, function(req,res) {
	var body = req.body;
	var usx = req.user;
	console.log('BOOKMARK_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
	_bookmarksupport(body, usx, function(err,result) {
		console.log('BOOKMARK_NEW_POST-1 '+err+' '+result);
		//technically, this should return to "/" since Lucene is not ready to display
		// the new post; you have to refresh the page in any case
		return res.redirect('/bookmark');
	});
  });
};