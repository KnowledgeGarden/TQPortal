/**
 * guild
 */
var Guild = require('../apps/guild/guildmodel'),
    constants = require('../core/constants'),
    types = require('tqtopicmap/lib/types')
;

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        GuildModel = new Guild(environment),
        CommonModel = environment.getCommonModel();
	
/*	var isAdmin = function(credentials) {
		console.log("GUILD.canEdit "+JSON.stringify(credentials));
		var result = false;
		if (credentials) {
			var where = credentials.indexOf(constants.ADMIN_CREDENTIALS);
			if (where > -1) {
				result = true;
			}
		}
		return result;
	}; */
	
	function isPrivate(req, res, next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {
				return next();
			} else {
				return res.redirect('/login');
			}
		} else {
			return next();
		}
	}

	function isLoggedIn(req, res, next) {
		// if user is authenticated in the session, carry on 
		console.log('ISLOGGED IN '+req.isAuthenticated());
		if (req.isAuthenticated()) {
			return next();
		} else if (isPrivatePortal) {
			// if they aren't redirect them to the home page
			// really should issue an error message
		
			return res.redirect('/login');
		} else {
			return res.redirect('/');
		}
	}

	/////////////////
	// Routes
	/////////////////
    /**
     * this is mirrored in issue.js
     */
	app.get('/guild', isPrivate, function guildGet(req, res) {
		var data = myEnvironment.getCoreUIData(req);
		//We can change the brand
		data.brand = "GetTheIssues";
		data.guildstart = 0;
		data.guildcount = constants.MAX_HIT_COUNT; //pagination size
		data.guildtotal =0;
		data.guildquery = "/guild/index";
		data.type = "landing";
	    return res.render('issuehome', data);
	});
	  
	/**
	 * Fire up the blog new post form
	 */
	app.get('/guild/new', isLoggedIn, function guildGetNew(req, res) {
		var data =  myEnvironment.getCoreUIData(req);
		data.formtitle = "New Guild";
	    data.isNotEdit = true;
		return  res.render('guildform', data); //,
	});

	/**
	 * Fire up the guild edit form on a given guild
	 */
	app.get('/guild/edit/:id', isLoggedIn, function guildGetEdit(req, res) {
		var q = req.params.id,
			usx = req.user,
			credentials = [];
		if (usx) {credentials = usx.credentials;}
		var data =  myEnvironment.getCoreUIData(req);
		data.formtitle = "Edit Guild";
		Dataprovider.getNodeByLocator(q, credentials, function guildGetNode(err, result) {
			myEnvironment.logDebug("GUILD.edit "+q+" "+result);
			if (result) {
				//A blog post is an AIR
				data.title = result.getSubject(constants.ENGLISH).theText; //TODO
				if (result.getBody(constants.ENGLISH)) {
					data.body = result.getBody(constants.ENGLISH).theText; //TODO
				}
				data.locator = result.getLocator();
				data.isNotEdit = false;
			}
			return res.render('guildform', data); 
		});
	});

	  
	/**
	 * Fetch based on page Next and Previous buttons from ajax
	 */
	app.get("/guild/index", isPrivate, function guildGetIndex(req, res) {
		var start = parseInt(req.query.start),
			count = parseInt(req.query.count),
			credentials= [];
		if (req.user) {credentials = req.user.credentials;}

		GuildModel.fillDatatable(start, count, credentials, function guildFillTable(data, countsent, totalavailable) {
			console.log("Guild.index "+data);
			var cursor = start+countsent,
				json = {};
			//pagination is based on start and count
			//both values are maintained in an html div
			json.guildstart = cursor;
			json.guildcount = constants.MAX_HIT_COUNT; //pagination size
			json.guildtotal = totalavailable;
			json.table = data;
			return res.json(json);
		});
	});

	/**
	 * Function which ties the app-embedded route back to here
	 */
	var _guildsupport = function(body, usx, callback) {
		var credentials = usx.credentials;
		if (body.locator === "") {
			GuildModel.create(body, usx, credentials, function guildCreate(err, result) {
				return callback(err,result);
			});
		} else {
	        GuildModel.update(body, usx, credentials, function guildUpdate(err, result) {
	            return callback(err,result);
	        });
		}
	};
    
	/**
	 * Handles posts from new and from edit
	 */
	app.post('/guild', isLoggedIn, function guildPost(req, res) {
	    var body = req.body,
			usx = req.user;
	    console.log('GUILD_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
	    _guildsupport(body, usx, function guildSupport(err, result) {
	      console.log('GUILD_NEW_POST-1 '+err+' '+result);
	      //technically, this should return to "/" since Lucene is not ready to display
	      // the new post; you have to refresh the page in any case
	      return res.redirect('/issue');
	    });
	});
	  
    /**
     * Join this guild
     */
    app.get('/guild/join/:id', isPrivate, function guildJoin(req, res) {
	    var body = req.body,
            usx = req.user,
            credentials = usx.credentials,
            q = req.params.id;
        Dataprovider.getNodeByLocator(q, credentials, function guildGetNode1(err, result) {
        	if (result) {
	            GuildModel.addMember(result, usx, function(err, rx) {
	                return res.redirect('/guild/'+q);
	            });
	        } else {
	        	return res.redirect('/error/GuildCannotJoin');
	        }
        });

    });

    
    /**
     * ViewFirst fetch of a guild
     */
	app.get("/guild/ajaxfetch/:id", isPrivate, function guildGetAjax(req, res) {
		//establish the node's identity
		var q = req.params.id;
		//establish credentials
		//defaults to an empty array if no user logged in
		var credentials = [];
		var usr = req.user;
		if (usr) { credentials = usr.credentials;}
		//fetch the node itself
		Dataprovider.getNodeByLocator(q, credentials, function guildGetNode2(err, result) {
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
			CommonModel.__doAjaxFetch(result, credentials,"/guild/", tags, docs, users, transcludes, data, req, function guildDoAjax(json) {
				myEnvironment.logDebug("Guild.ajaxfetch-1 "+JSON.stringify(json));
				//send the response
				return res.json(json);
			});
		});
	});
		  
	/**
	 * Model Fill ViewFirst: get cycle starts here
	 */
	app.get('/guild/:id', isPrivate, function guildGetId(req, res) {
		var q = req.params.id,
            credentials = [],
            usr = req.user;
		if (usr) {
			credentials = usr.credentials;
		}
		var data = myEnvironment.getCoreUIData(req);
		data.guildLocator = q;
		myEnvironment.logDebug("GUILDY "+JSON.stringify(req.query));
		CommonModel.__doGet(q,"/guild/",data, req, function guildDoGet(viewspec, data) {
            ///////////////////////////////////////////////
            // Messy hack:
            // In a guild view, we need to know if this user is a guild member
            // which means we have to fetch the damned guild node again (already fetched in CommonModel)
            // An ideal solution is to further customize the CommonModel function, but that's for later
            ///////////////////////////////////////////////
            var usr = req.user;
            if (usr) {
                Dataprovider.getNodeByLocator(q, credentials, function guildGetNode3(err, result) {
                	if (result) {
                    var ismem = GuildModel.isMember(result, usr.handle);
	                    if (ismem) {
	                        data.isMember = ismem;
	                    } else {
	                        data.canJoin = "true";
	                    }
	                    if (viewspec === "Dashboard") {
	                        return res.render('vf_guild', data);
	                    } else {
	                        return res.render('vfcn_guild',data);
	                    }
	                } else {
	                	res.redirect('/error/CannotLoadGuild');
	                }
                }); 
            } else {
                //this is an unanthenticated browser
                if (viewspec === "Dashboard") {
                    return res.render('vf_guild', data);
                } else {
                    return res.render('vfcn_guild',data);
                }
            }
		});
	});
};