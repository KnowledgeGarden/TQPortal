/**
 * guild
 */
var Guild = require('./guild/guildmodel'),
    constants = require('../core/constants'),
    types = require('../node_modules/tqtopicmap/lib/types')
;

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        GuildModel = new Guild(environment),
        CommonModel = environment.getCommonModel();
	
	var isAdmin = function(credentials) {
		console.log("BLOG.canEdit "+JSON.stringify(credentials));
		var result = false;
		if (credentials) {
			var where = credentials.indexOf(constants.ADMIN_CREDENTIALS);
			if (where > -1) {
				result = true;
			}
		}
		return result;
	};
	
	function isPrivate(req, res, next) {
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
	//environment.addApplicationToMenu("/guild","Guild");
	  /////////////////
	  // Routes
	  /////////////////
    /**
     * this is mirrored in issue.js
     */
	  app.get('/guild', isPrivate, function(req, res) {
		  var data = myEnvironment.getCoreUIData(req);
		  //We can change the brand
		  data.brand = "GetTheIssues";
		  data.guildstart = 0;
		  data.guildcount = constants.MAX_HIT_COUNT; //pagination size
		  data.guildtotal =0;
		  data.guildquery = "/guild/index";
		  data.type = "landing";
	    res.render('issuehome', data);
	  });
	  
	  /**
	   * Fire up the blog new post form
	   */
	  app.get('/guild/new', isLoggedIn, function(req, res) {
		var data =  myEnvironment.getCoreUIData(req);
		data.formtitle = "New Guild";
	    data.isNotEdit = true;
		res.render('guildform', data); //,
	  });
	  
	  /**
	   * Fetch based on page Next and Previous buttons from ajax
	   */
	  app.get("/guild/index", isPrivate, function(req, res) {
		var start = parseInt(req.query.start);
		var count = parseInt(req.query.count);
		var credentials= [];
		if (req.user) {credentials = req.user.credentials;}

		GuildModel.fillDatatable(start, count, credentials, function(data, countsent, totalavailable) {
			console.log("Guild.index "+data);
			var cursor = start+countsent;
			var json = {};
			//pagination is based on start and count
			//both values are maintained in an html div
			json.guildstart = cursor;
			json.guildcount = constants.MAX_HIT_COUNT; //pagination size
			json.guildquery = totalavailable;
			json.table = data;
			res.json(json);
		});
	  });

	  /**
	   * Function which ties the app-embedded route back to here
	   */
	  var _guildsupport = function(body, usx, callback) {
		var credentials = usx.credentials;
		if (body.locator === "") {
			GuildModel.create(body, usx, credentials, function(err, result) {
				callback(err,result);
			});
		} else {
	        GuildModel.update(body, usx, credentials, function(err, result) {
	            callback(err,result);
	        });
		}
	  };
    
	  /**
	   * Handles posts from new and from edit
	   */
	  app.post('/guild', isLoggedIn, function(req, res) {
	    var body = req.body;
	    var usx = req.user;
	    console.log('GUILD_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
	    _guildsupport(body, usx, function(err, result) {
	      console.log('GUILD_NEW_POST-1 '+err+' '+result);
	      //technically, this should return to "/" since Lucene is not ready to display
	      // the new post; you have to refresh the page in any case
	      return res.redirect('/issue');
	    });
	  });
	  
	  
	  app.get("/guild/ajaxfetch/:id", isPrivate, function(req, res) {
			//establish the node's identity
			var q = req.params.id;
			//establish credentials
			//defaults to an empty array if no user logged in
			var credentials = [];
			var usr = req.user;
			if (usr) { credentials = usr.credentials;}
			//fetch the node itself
			Dataprovider.getNodeByLocator(q, credentials, function(err, result) {
				console.log('GUILDrout-1 '+err+" "+result);
				var data =  myEnvironment.getCoreUIData(req);
				//Fetch the tags
				var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
				if (!tags) {
					tags = [];
				}
				var docs=[];
				var users=[];
				var transcludes=[];
				myEnvironment.logDebug("Guild.ajaxfetch "+JSON.stringify(data));
				CommonModel.__doAjaxFetch(result, credentials,"/guild/",tags,docs,users,transcludes,data,req,function(json) {
					myEnvironment.logDebug("Guild.ajaxfetch-1 "+JSON.stringify(json));
						//send the response
						res.json(json);
				} );
			});
		  });
		  
		  /**
		   * Model Fill ViewFirst: get cycle starts here
		   */
		  app.get('/guild/:id', isPrivate, function(req, res) {
			var q = req.params.id;
			var data = myEnvironment.getCoreUIData(req);
			myEnvironment.logDebug("GUILDY "+JSON.stringify(req.query));
			CommonModel.__doGet(q,"/guild/",data, req, function(viewspec, data) {
				if (viewspec === "Dashboard") {
					return res.render('vf_guild', data);
				} else {
					return res.render('vfcn_guild',data);
				}
			});
		  });
};