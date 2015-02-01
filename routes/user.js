/**
 * User app
 */
var userModel = require('../apps/user/usermodel'),
    constants = require('../core/constants'),
    common = require('../apps/common/commonmodel'),
    types = require('tqtopicmap/lib/types');


exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        UserModel = new userModel(environment),
        CommonModel = environment.getCommonModel(),

        self = this;

	console.log("Starting User "+UserModel);
  //TODO lots!
	self.canEdit = function(node, credentials) {
		console.log("USER.canEdit "+JSON.stringify(credentials));
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
		console.log("User.canEdit+ "+result);
		return result;
	};

  function isPrivate(req, res, next) {
	if (isPrivatePortal) {
      if (req.isAuthenticated()) {return next();}
      return res.redirect('/login');
	} else {
		return next();
	}
  };
    
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
  };
    
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/user","User");
  /////////////////
  // Routes
  /////////////////
	app.get('/user', isPrivate, function userGet(req, res) {
	  var data = environment.getCoreUIData(req);
	  data.start=0;
	  data.count=constants.MAX_HIT_COUNT; //pagination size
	  data.total=0;
	  data.query="/user/index";
	  //rendering this will cause an ajax query to blog/index
	  return res.render('userindex',data);
	});
	
	app.get("/user/index", isPrivate, function userGetIndex(req, res) {
	  var start = parseInt(req.query.start);
	  var count = parseInt(req.query.count);
//	  var isNext = req.query.isNext.trim();
//	  myEnvironment.logDebug("BLOG INDEX "+start+" "+count+" "+isNext);
	  var credentials= [];
	  if (req.user) {credentials = req.user.credentials;}

	  UserModel.fillDatatable(start, count, credentials, function userFillTable(data, countsent, totalavailable) {
		  console.log("User.index "+data);
		  var cursor;
		  //if (isNext === "T") {
			  cursor = start+countsent;
		  //} else {
		//	  cursor = start-countsent;
		 // }
		//  if (cursor < 0) {cursor = 0;}
		//  myEnvironment.logDebug("BLOG INDEX2 "+start+" "+countsent+" "+isNext+" "+cursor);
		  var json = {};
		  json.start = cursor;
		  json.count = constants.MAX_HIT_COUNT; //pagination size
		  json.total = totalavailable;
		  json.table = data;
	      return res.json(json);
	  });
	});

	app.get('/user/edit/:id', isLoggedIn, function userGetEdit(req, res) {
		var q = req.params.id;
		var usx = req.user;
		var credentials = [];
		if (usx) {credentials = usx.credentials;}
		var data =  myEnvironment.getCoreUIData(req);
		Dataprovider.getNodeByLocator(q, credentials, function userGetNode(err, result) {
			myEnvironment.logDebug("User.edit "+q+" "+result);
			if (result) {
				if (result.getBody(constants.ENGLISH)) {
					data.body = result.getBody(constants.ENGLISH).theText;
				}
				data.locator = result.getLocator();
			}
			return res.render('userform', data); //,
		});
	});

	var _usersupport = function(body,usx, callback) {
		var credentials = usx.credentials;
		UserModel.update(body, usx, credentials, function userUpdate(err,result) {
          callback(err,result);
      });
	};
  
	app.post('/user', isLoggedIn, function userPost(req, res) {
		var body = req.body;
		var usx = req.user;
		console.log('USER_EDIT '+JSON.stringify(usx)+' | '+JSON.stringify(body));
		_usersupport(body, usx, function userSupport(err, result) {
		console.log('USER_EDIT-1 '+err+' '+result);
			return res.redirect('/user');
		});
	});
  
	app.get("/user/ajaxfetch/:id", isPrivate, function userGetAjax(req, res) {
	    var q = req.params.id,
			lang = req.query.language,
			viewspec = "Dashboard";
	    console.log('USERajax '+q+" "+lang);
	    var credentials = [],
			usr = req.user;
	    if (usr) { credentials = usr.credentials;}
	    Dataprovider.getNodeByLocator(q, credentials, function userGetNode1(err, result) {
			console.log('USERrout-1 '+err+" "+result);
			if (result) {
				var data = myEnvironment.getCoreUIData(req),
					contextLocator;
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
				var canEdit = self.canEdit(result,credentials),
					clipboard = req.session.clipboard,	    	  
					editLocator = "/user/edit/"+result.getLocator(),
					tags = result.listPivotsByRelationType(types.TAG_CREATOR_RELATION_TYPE); //types.TAG_DOCUMENT_RELATION_TYPE);
				if (!tags) {
					tags = [];
				}
				var docs = result.listPivotsByRelationType(types.CREATOR_DOCUMENT_RELATION_TYPE);
				if (!docs) {
					docs = [];
				}
				var transcludeList =result.listPivotsByRelationType(types.DOCUMENT_TRANSCLUDER_RELATION_TYPE);
	            if (!transcludeList) {
	                transcludeList = [];
	            }
				CommonModel.generateViewFirstData(result, tags, docs,[], credentials, canEdit, data, contextLocator, "/user/", clipboard, lang, transcludeList, viewspec, function userGetnerateView(json) {
					json.myLocatorXP = q+"?contextLocator="+contextLocator;
					json.myLocator = q;
					console.log("XXXX "+JSON.stringify(json));
					return res.json(json);
				});
			} else {
				return res.redirect('/error/UnableToDisplay');
			}
	    });
	      
	});

	app.get('/user/:id', isPrivate, function userGetId(req, res) {
	    var q = req.params.id;
	    console.log('USERrout '+q);
	    var data = myEnvironment.getCoreUIData(req);
	    data.query = "/user/ajaxfetch/"+q;
	    data.language = "en";
	    data.type = "foo";
	    if (req.query.contextLocator) {
	    	data.contextLocator = req.query.contextLocator;
	    }
	    res.render('vf_topic', data);
	});


};