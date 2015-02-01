/**
 * Blog app
 */
var acls = require('../apps/blog/blogmodel'),
    constants = require('../core/constants'),
    common = require('../apps/common/commonmodel'),
    types = require('tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        CommonModel = environment.getCommonModel(),
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        BlogModel = new acls(environment),
        self = this;

	console.log("Starting Blog "+this.BlogModel);
  
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
		return res.redirect('/');
	}
 
	/////////////////
	// Menu
	/////////////////
	myEnvironment.addApplicationToMenu("/blog","Blog");
	
  /////////////////
  // Routes
  /////////////////
	
  /**
   * Initial fetch of the /blog landing page
   */
  app.get('/blog', isPrivate, function blogGet(req, res) {
	var data = environment.getCoreUIData(req);
	data.start=0;
	data.count=constants.MAX_HIT_COUNT; //pagination size
	data.total=0;
	data.query="/blog/index";
	//rendering this will cause an ajax query to blog/index
	return res.render('blogindex',data);
  });

  /**
   * Fetch based on page Next and Previous buttons from ajax
   */
  app.get("/blog/index", isPrivate, function blogGetIndex(req, res) {
	var start = parseInt(req.query.start);
	var count = parseInt(req.query.count);
	var credentials= [];
	if (req.user) {credentials = req.user.credentials;}

	BlogModel.fillDatatable(start,count, credentials, function blogFillTable(data, countsent, totalavailable) {
		console.log("Blog.index "+data);
		var cursor = start+countsent;
		var json = {};
		//pagination is based on start and count
		//both values are maintained in an html div
		json.start = cursor;
		json.count = constants.MAX_HIT_COUNT; //pagination size
		json.total = totalavailable;
		json.table = data;
		return res.json(json);
	});
  });
		
  /**
   * Fire up the blog new post form
   */
  app.get('/blog/new', isLoggedIn, function blogGetNew(req, res) {
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "New Article";
    data.isNotEdit = true;
	return res.render('blogform', data); //,
  });
  
  /**
   * Fire up the blog edit form on a given node
   */
  app.get('/blog/edit/:id', isLoggedIn, function blogGetEdit(req, res) {
	var q = req.params.id;
	var usx = req.user;
	var credentials = [];
	if (usx) {credentials = usx.credentials;}
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "Edit Article";
	Dataprovider.getNodeByLocator(q, credentials, function blogGetNode(err, result) {
		myEnvironment.logDebug("BLOG.edit "+q+" "+result);
		if (result) {
			//A blog post is an AIR
			data.title = result.getSubject(constants.ENGLISH).theText;
			if (result.getBody(constants.ENGLISH)) {
				data.body = result.getBody(constants.ENGLISH).theText;
			}
			data.locator = result.getLocator();
			data.isNotEdit = false;
		}
		return res.render('blogform', data); //,
	});
  });
  
  
  /**
   * Model "ajaxfetch"
   * <pre>app.get('/<app>/ajaxfecth/:id', ...) is called
   * by way of main.js at the browser as defined in html by
   * app.get('/<app>/:id'...)</pre>
   */
  //TODO this will become more complex when we use viewspec to
  //decide if to fill the P-Conversation tab, which isn't used
  //in Conversation mode
	app.get("/blog/ajaxfetch/:id", isPrivate, function blogGetAjax(req, res) {
		//establish the node's identity
		var q = req.params.id;
		//establish credentials
		//defaults to an empty array if no user logged in
		var credentials = [],
			usr = req.user;
		if (usr) { credentials = usr.credentials;}
		//fetch the node itself
		Dataprovider.getNodeByLocator(q, credentials, function blogGetNode1(err, result) {
			console.log('BLOGrout-1 '+err+" "+result);
			if (result) {
				var data =  myEnvironment.getCoreUIData(req);
				//Fetch the tags
				var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
				if (!tags) {
					tags = [];
				}
				var docs=[],
					users=[],
					transcludes=result.listPivotsByRelationType(types.DOCUMENT_TRANSCLUDER_RELATION_TYPE);
				if (!transcludes) {
		                transcludes = [];
				}
				myEnvironment.logDebug("Blog.ajaxfetch "+JSON.stringify(data));
				CommonModel.__doAjaxFetch(result, credentials, "/blog/", tags, docs, users, transcludes, data, req, function blogDoAjax(json) {
					myEnvironment.logDebug("Blog.ajaxfetch-1 "+JSON.stringify(json));
						//send the response
						return res.json(json);
				});
			} else {
				return res.redirect('/error/UnableToDisplay');
			}
		});
	});
  
  /**
   * Model Fill ViewFirst: get cycle starts here
   */
  app.get('/blog/:id', isPrivate, function blogGetId(req, res) {
	var q = req.params.id,
		data = myEnvironment.getCoreUIData(req);
	myEnvironment.logDebug("BLOGGY "+JSON.stringify(req.query));
	CommonModel.__doGet(q,"/blog/", data, req, function blogDoGet(viewspec, data) {
		if (viewspec === "Dashboard") {
			return res.render('vf_topic', data);
		} else {
			return res.render('vfcn_topic', data);
		}
	});
  });
  
  /**
   * Function which ties the app-embedded route back to here
   */
  var _blogsupport = function(body,usx, callback) {
	if (body.locator === "") {
		BlogModel.create(body, usx, function blogCreate(err, result) {
			return callback(err, result);
		});
	} else {
        BlogModel.update(body, usx, function blogUpdate(err, result) {
            return callback(err, result);
        });
	}
  };
    
  /**
   * Handles posts from new and from edit
   */
  app.post('/blog', isLoggedIn, function blogPost(req, res) {
    var body = req.body,
		usx = req.user;
    console.log('BLOG_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
      myEnvironment.logDebug("BLOG POST "+JSON.stringify(body));
    _blogsupport(body, usx, function blogSupport(err, result) {
      console.log('BLOG_NEW_POST-1 '+err+' '+result);
      //technically, this should return to "/" since Lucene is not ready to display
      // the new post; you have to refresh the page in any case
      return res.redirect('/blog');
    });
  });
};