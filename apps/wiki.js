/**
 * Wiki app
 */
var wm = require('./wiki/wikimodel'),
    types = require('../node_modules/tqtopicmap/lib/types'),
    common = require('./common/commonmodel'),
    constants = require('../core/constants')
;

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        CommonModel = environment.getCommonModel(),
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        WikiModel = new wm(environment),
        self = this;

	console.log("Starting Wiki "+WikiModel);

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
		myEnvironment.logDebug("WIKI.edit "+q+" "+result);
		if (result) {
			//A blog post is an AIR
			data.title = result.getSubject(constants.ENGLISH).theText;
			if (result.getBody(constants.ENGLISH)) {
				data.body = result.getBody(constants.ENGLISH).theText;
			}
			data.locator = result.getLocator();
			data.isNotEdit = false;
		}
		res.render('wikiform', data); //,
	});
  });
  
  app.get("/wiki/ajaxfetch/:id", isPrivate, function(req,res) {
		//establish the node's identity
		var q = req.params.id;
		//establish credentials
		//defaults to an empty array if no user logged in
		var credentials = [];
		var usr = req.user;
		if (usr) { credentials = usr.credentials;}
		//fetch the node itself
		Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
			console.log('WIKIrout-1 '+err+" "+result);
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
			myEnvironment.logDebug("Wiki.ajaxfetch "+JSON.stringify(data));
			CommonModel.__doAjaxFetch(result, credentials,"/wiki/",tags,docs,users,transcludes,data,req,function(json) {
				myEnvironment.logDebug("Wiki.ajaxfetch-1 "+JSON.stringify(json));
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
  app.get('/wiki/:id', isPrivate,function(req,res) {
	var q = req.params.id;
	var data = myEnvironment.getCoreUIData(req);
	myEnvironment.logDebug("WIKIY "+JSON.stringify(req.query));
	CommonModel.__doGet(q,"/wiki/",data, req, function(viewspec, data) {
		if (viewspec === "Dashboard") {
			return res.render('vf_topic', data);
		} else {
			return res.render('vfcn_topic',data);
		}
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
			myEnvironment.logDebug("Wiki.edit "+q+" "+result);
			if (result) {
				//A blog post is an AIR
				data.title = result.getSubject(constants.ENGLISH).theText;
				if (result.getBody(constants.ENGLISH)) {
					data.body = result.getBody(constants.ENGLISH).theText;
				}
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