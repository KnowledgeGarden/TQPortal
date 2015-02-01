/**
 * tag app
 */
var tagModel = require('../apps/tag/tagmodel'),
    constants = require('../core/constants'),
    common = require('../apps/common/commonmodel'),
    types = require('tqtopicmap/lib/types')
;


exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        CommonModel = environment.getCommonModel(),
        TagModel = new tagModel(environment);


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
	environment.addApplicationToMenu("/tag","Tag");

	/////////////////
	// Routes
	/////////////////
	app.get('/tag', isPrivate, function tagGet(req, res) {
		  var data = environment.getCoreUIData(req);
		  data.start=0;
		  data.count=constants.MAX_HIT_COUNT; //pagination size
		  data.total=0;
		  data.query="/tag/index";
		  //rendering this will cause an ajax query to blog/index
		  res.render('tagindex',data);
	});

	app.get('/tag/addtag/:id', isLoggedIn, function tagGetAddTag(req, res) {
		  var data = environment.getCoreUIData(req);
			var q = req.params.id;
		  data.locator = q;
		  res.render('addtagform',data);
			  
	});
	  
	app.post('/tag/add', isPrivate, function tagPostAdd(req, res) {
	    var body = req.body;
	    var usx = req.user;
		var credentials = usx.credentials;
		console.log("Tag.add "+JSON.stringify(body));
		TagModel.addTagsToNode(body,usx,credentials, function tagAddTags(err, data) {
			console.log("Tag.add "+err);
			res.redirect('/');
		});
	});
	  
	app.get('/tag/edit/:id', isLoggedIn, function tagGetEdit(req, res) {
			var q = req.params.id;
			var usx = req.user;
			var credentials = [];
			if (usx) {credentials = usx.credentials;}
			var data =  myEnvironment.getCoreUIData(req);
			Dataprovider.getNodeByLocator(q, credentials, function tagGetNode(err, result) {
				myEnvironment.logDebug("TAG.edit "+q+" "+result);
				if (result) {
					data.title = result.getLabel(constants.ENGLISH);
					data.body = result.getDetails(constants.ENGLISH);
					data.locator = result.getLocator();
					data.isNotEdit = false;
				}
				res.render('tagform', data); //,
			});
	});
		
	app.get("/tag/index", isPrivate, function tagGetIndex(req, res) {
		  var start = parseInt(req.query.start);
		  var count = parseInt(req.query.count);
//		  var isNext = req.query.isNext.trim();
//		  myEnvironment.logDebug("BLOG INDEX "+start+" "+count+" "+isNext);
		  var credentials= [];
		  if (req.user) {credentials = req.user.credentials;}

		  TagModel.fillDatatable(start, count, credentials, function tagFillTable(data, countsent, totalavailable) {
			  console.log("Tag.index "+data);
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
			  try {
				  res.set('Content-type', 'text/json');
			  }  catch (e) { }
		      res.json(json);
		  });
	});

	app.get("/tag/ajaxfetch/:id", isPrivate, function tagGetAjax(req, res) {
		    var q = req.params.id;
			var lang = req.query.language;
		    console.log('TAGajax '+q+" "+lang);
		    var viewspec = "Dashboard";
		    var credentials = [];
		    var usr = req.user;
		    if (usr) { credentials = usr.credentials;}
		    Dataprovider.getNodeByLocator(q, credentials, function tagGetNode1(err, result) {
				console.log('TAGrout-1 '+err+" "+result);
				if (result) {
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
				    	  var clipboard = req.session.clipboard;
				/**	    //Allow Admins to edit tag
				    	  var canEdit = false;
				    	  if (credentials.indexOf(constants.ADMIN_CREDENTIALS) > -1) {
				    		  canEdit = true;
				    	  }
				    	  
				    	  var editLocator = "/tag/edit/"+result.getLocator();
				    	  */

					      var docs = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
					      if (!docs) {
					    	  docs = [];
					      }
					      var users = result.listPivotsByRelationType(types.TAG_CREATOR_RELATION_TYPE);
					      if (!users) {
					    	  users = [];
					      }
					      var transcludeUser = "";  //TODO
					CommonModel.generateViewFirstData(result, [], docs,users,credentials, canEdit, data, contextLocator, "/tag/", clipboard, lang, transcludeUser, viewspec, function tagGenerateView(json) {
			  			json.canEdit = false; // prevent editing
					  //get all parents
						CommonModel.fillConversationTable(true, true, q, "", credentials, function tagFillConTable1(err, cresult) {
							if (cresult) {
							  json.ccontable = cresult;
							}
						  //get just my parents in particular context
							CommonModel.fillConversationTable(true, false, q, contextLocator, credentials, function tagFillConTable2(err,presult) {
							  if (presult) {
								  json.pcontable = presult;
							  }
						       return res.json(json);
							});

						});
			    	  
					});
				} else {
					return res.redirect('/error/UnableToDisplayTag');
				}
		    });
		      
	});

	app.get('/tag/:id', isPrivate, function tagGetId(req, res) {
	    var q = req.params.id;
	    console.log('TAGrout '+q);
	    var data = myEnvironment.getCoreUIData(req);
	    data.query = "/tag/ajaxfetch/"+q;
	    data.language = "en";
	    data.type = "foo";
	    if (req.query.contextLocator) {
	    	data.contextLocator = req.query.contextLocator;
	    }
	    res.render('vf_topic', data);
	});
	
	/**
	 * Used to update a tag
	 */
	app.post('/tag', isPrivate, function tagPost(req, res) {
	    var body = req.body;
	    var usx = req.user;
		var credentials = usx.credentials;
	    TagModel.update(body, usx, credentials, function tagUpdate(err, result) {
	    	return res.redirect('/tag');
        });
	});

};