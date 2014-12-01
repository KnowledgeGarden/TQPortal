/**
 * quest
 */
var quest = require('./quest/questmodel'),
    constants = require('../core/constants'),
    types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider(),
        QuestModel = new quest(environment),
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
	//environment.addApplicationToMenu("/quest","Quest");
	  /////////////////
	  // Routes
	  /////////////////
    /**
     * In the present design,this is never called since
     * this is really just a tab in issuehome, which means this belongs
     * in issue.js
     */
	  app.get('/quest', isPrivate, function(req, res) {
		  var data = myEnvironment.getCoreUIData(req);
		  //We can change the brand
		  data.brand = "GetTheIssues";
		  data.queststart = 0;
		  data.questcount=constants.MAX_HIT_COUNT; //pagination size
		  data.questtotal = 0;
		  data.questquery = "/quest/index";
	    return res.render('issuehome',data);
	  });
	  
	  /**
	   * Fire up the blog new post form
	   */
	  app.get('/quest/new/:id', isLoggedIn, function(req, res) {
          var q = req.params.id,
              data =  myEnvironment.getCoreUIData(req);
          data.formtitle = "New Quest";
          data.isNotEdit = true;
          data.parent = q;
          return res.render('questform', data);
	  });
	  
	  /**
	   * Fetch based on page Next and Previous buttons from ajax
	   */
	  app.get("/quest/index", isPrivate, function(req, res) {
		var start = parseInt(req.query.start);
		var count = parseInt(req.query.count);
		var credentials = [];
		if (req.user) {credentials = req.user.credentials;}

		QuestModel.fillDatatable(start,count, credentials, function(data, countsent,totalavailable) {
			console.log("Quest.index "+data);
			var cursor = start+countsent;
			var json = {};
			//pagination is based on start and count
			//both values are maintained in an html div
			json.queststart = cursor;
			json.questcount = constants.MAX_HIT_COUNT; //pagination size
			json.questtotal = totalavailable;
			json.table = data;
			return res.json(json);
		});
	  });
    
	  /**
	   * Handles posts from new and from edit
	   */
	  app.post('/quest', isLoggedIn, function(req, res) {
	    var body = req.body,
            usx = req.user,
            credentials = usx.credentials;
          //Two hidden variables: locator means this is an edit
          //  parent means this is a new quest against a parent issue
		if (body.locator === "") {
            console.log("Quest-2");
			QuestModel.create(body, usx, credentials, function(err, result) {
                myEnvironment.logDebug('QUEST_NEW_POST-3 '+res.headersSent);
                //TODO: we really mostly ignore err here; ought to find something
                // really sophisticated to do with error messages
                //technically, this should return to "/" since Lucene is not ready to display
                // the new post; you have to refresh the page in any case
                return res.redirect('/issue');
			});
		} else {
 	        QuestModel.update(body, usx, credentials, function(err,result) {
                 console.log("Quest-5 "+err);
               //TODO: we really mostly ignore err here; ought to find something
                // really sophisticated to do with error messages
                //technically, this should return to "/" since Lucene is not ready to display
                // the new post; you have to refresh the page in any case
                return res.redirect('/issue');
	        });
		}
	  });
	  
	  
	  app.get("/quest/ajaxfetch/:id", isPrivate, function(req, res) {
			//establish the node's identity
			var q = req.params.id;
			//establish credentials
			//defaults to an empty array if no user logged in
			var credentials = [];
			var usr = req.user;
			if (usr) { credentials = usr.credentials;}
			//fetch the node itself
			Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
				console.log('QUESTrout-1 '+err+" "+result);
				var data =  myEnvironment.getCoreUIData(req);
				//Fetch the tags
				var tags = result.listPivotsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
				if (!tags) {
					tags = [];
				}
				var docs=[];
				var users=[];
				var transcludes=[];
				myEnvironment.logDebug("Quest.ajaxfetch "+JSON.stringify(data));
				CommonModel.__doAjaxFetch(result, credentials,"/quest/",tags,docs,users,transcludes,data,req,function(json) {
					myEnvironment.logDebug("Quest.ajaxfetch-1 "+JSON.stringify(json));
						//send the response
						return res.json(json);
				});
			});
		  });
		  
		  /**
		   * Model Fill ViewFirst: get cycle starts here
		   */
		  app.get('/quest/:id', isPrivate,function(req,res) {
			var q = req.params.id;
			var data = myEnvironment.getCoreUIData(req);
			myEnvironment.logDebug("QUESTY "+JSON.stringify(req.query));
			CommonModel.__doGet(q,"/quest/",data, req, function(viewspec, data) {
				if (viewspec === "Dashboard") {
					return res.render('vf_quest', data);
				} else {
					return res.render('vfcn_quest',data);
				}
			});
		  });
};