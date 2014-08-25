/**
 * Blog app
 */
var acls = require('./blog/blogmodel')
  , constants = require('../core/constants')
, common = require('./common/commonmodel')
  , types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var CommonModel = environment.getCommonModel();
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var BlogModel = new acls(environment);
	var MAPTYPE = "1";

	console.log("Starting Blog "+this.BlogModel);
  
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
	myEnvironment.addApplicationToMenu("/blog","Blog");
  /////////////////
  // Routes
  /////////////////
  app.get('/blog', isPrivate,function(req,res) {
	  var data = environment.getCoreUIData(req);
	  data.start=0;
	  data.count=constants.MAX_HIT_COUNT; //pagination size
	  data.total=0;
	  data.query="/blog/index";
	  //rendering this will cause an ajax query to blog/index
	  res.render('blogindex',data);
  });
	
  app.get("/blog/index", isPrivate,function(req,res) {
	  var start = parseInt(req.query.start);
	  var count = parseInt(req.query.count);
	  var credentials= [];
	  if (req.user) {credentials = req.user.credentials;}

	  BlogModel.fillDatatable(start,count, credentials, function(data, countsent,totalavailable) {
		  console.log("Blog.index "+data);
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
		
  app.get('/blog/new', isLoggedIn, function(req,res) {
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "New Article";
    data.isNotEdit = true;
	res.render('blogform',data); //,
  });
  
  app.get('/blog/edit/:id', isLoggedIn, function(req,res) {
	var q = req.params.id;
	var usx = req.user;
	var credentials = [];
	if (usx) {credentials = usx.credentials;}
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "Edit Article";
	Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
		topicMapEnvironment.logDebug("BLOG.edit "+q+" "+result);
		if (result) {
			//A blog post is an AIR
			data.title = result.getSubject(constants.ENGLISH).theText;
			if (result.getBody(constants.ENGLISH)) {
				data.body = result.getBody(constants.ENGLISH).theText;
			}
			data.locator = result.getLocator();
			data.isNotEdit = false;
		}
		res.render('blogform', data); //,
	});
  });
  
  app.get("/blog/ajaxfetch/:id", isPrivate, function(req,res) {
	    var q = req.params.id;
		var lang = req.query.language;
	    console.log('BLOGajax '+q+" "+lang);
	    var credentials = [];
	    var usr = req.user;
	    if (usr) { credentials = usr.credentials;}
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('BLOGrout-1 '+err+" "+result);
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
		    	  
		    	  var editLocator = "/blog/edit/"+result.getLocator();
		    	  

			      var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
			      if (!tags) {
			    	  tags = [];
			      }

	      CommonModel.generateViewFirstData(result, tags, [],[],credentials, canEdit, data, contextLocator, "/blog/", clipboard, lang, function(json) {
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
  app.get('/blog/:id', isPrivate,function(req,res) {
	    var q = req.params.id;
	    console.log('BLOGrout '+q);
	    var data = myEnvironment.getCoreUIData(req);
	    data.query = "/blog/ajaxfetch/"+q;
	    data.language = "en";
	    data.type = "foo";
	    if (req.query.contextLocator) {
	    	data.contextLocator = req.query.contextLocator;
	    }
	    res.render('vf_topic', data);
  });
  
  /**
   * Function which ties the app-embedded route back to here
   */
  var _blogsupport = function(body,usx, callback) {
    var credentials = usx.credentials;
    if (body.locator === "") {
    	BlogModel.create(body, usx, credentials, function(err,result) {
    		callback(err,result);
    	});
    } else {
        BlogModel.update(body, usx, credentials, function(err,result) {
            callback(err,result);
        });
   }
  };
    
  app.post('/blog', isLoggedIn, function(req,res) {
    var body = req.body;
    var usx = req.user;
    console.log('BLOG_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
    _blogsupport(body, usx, function(err,result) {
      console.log('BLOG_NEW_POST-1 '+err+' '+result);
      //technically, this should return to "/" since Lucene is not ready to display
      // the new post; you have to refresh the page in any case
      return res.redirect('/blog');
    });
  });
};