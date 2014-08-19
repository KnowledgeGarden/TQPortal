/**
 * Bookmark app
 * javascript:location.href='http://<serverurl>/bookmark/new?url='+           
 *   encodeURIComponent(location.href)+'&title='+         
 *   encodeURIComponent(document.title)
 */
var bkmrk = require('./bookmark/bookmarkmodel')
, constants = require('../core/constants')
  , types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var CommonModel = environment.getCommonModel();
	var Dataprovider = topicMapEnvironment.getDataProvider();
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
	  var credentials= [];
	  if (req.user) {credentials = req.user.credentials;}
	  var data = environment.getCoreUIData(req);
	  BookmarkModel.fillDatatable(credentials, function(datax) {
		  var x = datax;
		  if (x) {
			  x = x.data;
		  }
		  data.sadtable = x;
		  res.render('bookmarkindex',data);
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

  app.get("/bookmark/ajaxfetch/:id", isPrivate, function(req,res) {
	    var q = req.params.id;
		var lang = req.query.language;
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
			    topicMapEnvironment.logDebug("Bookmark.ajaxfetch "+q+" "+contextLocator);
		    	  var canEdit = self.canEdit(result,credentials);
		    	  var clipboard = req.session.clipboard;
		    	  
		    	  var editLocator = "/bookmark/edit/"+result.getLocator();
		    	  

			      var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
			      if (!tags) {
			    	  tags = [];
			      }

	      CommonModel.generateViewFirstData(result, tags, [],[],credentials, canEdit, data, contextLocator, "/bookmark/", clipboard, lang, function(json) {
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
  app.get('/bookmark/:id', isPrivate,function(req,res) {
	    var q = req.params.id;
	    console.log('Bookmarkrout '+q);
	    var data = myEnvironment.getCoreUIData(req);
	    data.query = "/bookmark/ajaxfetch/"+q;
	    data.language = "en";
	    data.type = "foo";
	    if (req.query.contextLocator) {
	    	data.contextLocator = req.query.contextLocator;
	    }
	    res.render('vf_topic', data);
  });

  var _bookmarksupport = function(body,usx, callback) {
	var credentials = usx.credentials;
	if (body.locator === "") {
		BookmarkModel.create(body, usx, credentials, function(err,result) {
			callback(err,result);
		});
	} else {
		BookmarkModel.update(body, usx, credentials, function(err,result) {
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