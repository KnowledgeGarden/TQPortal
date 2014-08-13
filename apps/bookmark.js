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
  this.BookmarkModel = new bkmrk(environment);
  console.log("Starting Bookmark "+this.BookmarkModel);
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
	  res.render('bookmarkindex', __get(req));
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
  app.get('/bookmark/ajaxtopicnode/:id', function(req, res) {
	    var q = req.params.id;
	    console.log('AJAXTOPICNODE '+q);
	    var credentials = [];
	    if (req.user) { credentials = req.user.credentials;}
	    //get all parents
	    CommonModel.fillConversationTable(false, true,q,"",credentials,function(err,result) {
	        try {
	            res.set('Content-type', 'text/json');
	          }  catch (e) { }
	          res.json(result);

	    });
  });
  app.get('/bookmark/ajaxptopicnode/:id', function(req, res) {
	    var q = req.params.id;
	    console.log('AJAXTOPICNODE '+q);
	    var credentials = [];
	    if (req.user) { credentials = req.user.credentials;}
	    var contxt = req.query.contextLocator;
	    //get just my children
	    CommonModel.fillConversationTable(false, false,q,contxt,credentials,function(err,result) {
	        try {
	            res.set('Content-type', 'text/json');
	          }  catch (e) { }
	          res.json(result);

	    });
  });
  
  app.get('/bookmark/:id', isPrivate,function(req,res) {
	    var q = req.params.id;
	    console.log('BOOKMARKrout '+q);
	    var credentials = [];
	    var usr = req.user;
	    if (usr) { credentials = usr.credentials;}
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('BOOKMARKrout-1 '+err+" "+result);
	      var data = myEnvironment.getCoreUIData(req);
	      if (result) {
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
	    	  //This is an AIR
	    	  var title = result.getSubject(constants.ENGLISH).theText;
		      var details = "";
		      if (result.getBody(constants.ENGLISH)) {
		    	  details = result.getBody(constants.ENGLISH).theText;
		      }
	    	  var userid = result.getCreatorId();
	    	  // paint tags
	    	  var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
	    	  var annotations = result.listPivotsByRelationType(types.DOCUMENT_ANNOTATION_RELATION_TYPE);
	    	  console.log("Blogs.XXX "+JSON.stringify(tags));
	    	  var canEdit = self.canEdit(result,credentials);
	    	  data.canEdit = canEdit;
	    	  data.isNotEdit = true;
	    	  data.editLocator = "/blog/edit/"+result.getLocator();
	    	  var date = result.getLastEditDate();
	    	  data.locator = q;
	    	  if (result.getResourceUrl()) {
	    		  data.url = result.getResourceUrl();
	    	  }
	    	  data.title = title;
	    	  data.body = details;
	    	  data.tags = tags;
	    	  data.annotations = annotations;
	    	  data.source = result.toJSON();
	    	  data.date = date;
	    	  console.log("BLOGrout-X "+data.canEdit+" "+data.editLocator);
	    	  data.user = userid;
	    	  data.image = result.getImage();
	    	  //TODO NOT sure we want to transclude blog posts
	    	  data.myLocator = q;
	    	  data.myLocatorXP = q+"?contextLocator="+contextLocator;
		      if (credentials.length > 0 && req.session.clipboard === "") {
		    	  data.transclude = "yes";
		      }
		      if (contextLocator) {
		    	  data.contextLocator = contextLocator;
		    	  //TODO this must be used in the transclude button
		      }

	    	  console.log('BLOGrout-2 '+JSON.stringify(data));
	      }
	      res.render('topic', data);
	    });
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