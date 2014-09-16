/**
 * Bookmark app
 * javascript:location.href='http://<serverurl>/bookmark/new?url='+           
 *   encodeURIComponent(location.href)+'&title='+         
 *   encodeURIComponent(document.title)
 */
var bkmrk = require('./bookmark/bookmarkmodel'),
    constants = require('../core/constants'),
    types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        CommonModel = environment.getCommonModel(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        BookmarkModel = new bkmrk(environment),
        self = this;

  console.log("Starting Bookmark "+BookmarkModel);
 
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
			var transcludes=result.listPivotsByRelationType(types.DOCUMENT_TRANSCLUDER_RELATION_TYPE);
            if (!transcludes) {
                transcludes = [];
            }
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