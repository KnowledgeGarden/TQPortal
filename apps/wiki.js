/**
 * Wiki app
 */
var wm = require('./wiki/wikimodel')
 , types = require('../node_modules/tqtopicmap/lib/types')
  , constants = require('../core/constants')
;

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  this.WikiModel = new wm(environment);
  console.log("Starting Wiki "+this.WikiModel);
	var self = this;
	self.canEdit = function(node, credentials) {
		console.log("Wiki.canEdit "+JSON.stringify(credentials));
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
			console.log("Wiki.canEdit_ "+cid+" "+where+" "+result);
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
	environment.addApplicationToMenu("/wiki","Wiki");
  /////////////////
  // Routes
  /////////////////
  app.get('/wiki', isPrivate,function(req,res) {
    res.render('wikihome', environment.getCoreUIData(req));
  });
  
  app.get('/wiki/edit/:id', isLoggedIn, function(req,res) {
	var q = req.params.id;
	var usx = req.user;
    var credentials = null;
	if (usx) {credentials = usx.credentials;}
	var data =  myEnvironment.getCoreUIData(req);
	data.formtitle = "Edit Topic";
	Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
		topicMapEnvironment.logDebug("WIKI.edit "+q+" "+result);
		if (result) {
			//A blog post is an AIR
			data.title = result.getSubject(constants.ENGLISH).theText;
			data.body = result.getBody(constants.ENGLISH).theText;
			data.locator = result.getLocator();
			data.isNotEdit = false;
		}
		res.render('wikiform', data); //,
	});
  });

  app.get('/wiki/:id', isPrivate,function(req,res) {
	  var usx = req.user;
	    var q = req.params.id;
	    console.log('WIKIrout '+q);
	    var credentials = null;
	    	if (usx) {credentials = usx.credentials;}
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('WIKIrout-1 '+err+" "+JSON.stringify(result)); //result.toJSON);
	      console.log('WIKIrout-1a '+err+" "+result.toJSON()); //result.toJSON);
	      var data = myEnvironment.getCoreUIData(req);
	      var title = result.getSubject(constants.ENGLISH).theText;
	      var details = result.getBody(constants.ENGLISH).theText;
	      var userid = result.getCreatorId();
	      // paint tags
	      var tags = result.listRelationsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
	      console.log("Wiki.XXX "+JSON.stringify(tags));
    	  var canEdit = self.canEdit(result,credentials);
    	  data.canEdit = canEdit;
    	  data.isNotEdit = true;
    	  data.editLocator = "/wiki/edit/"+result.getLocator();
	     
	      var date = result.getLastEditDate();
	      data.title = title;
	      data.body = details;
	      data.tags = tags;
	      data.source = result.toJSON();
	      data.date = date;
	      data.user = userid;

	      data.image = "/images/publication.png";
	      console.log('WIKIrout-2 '+JSON.stringify(data));
	      res.render('topic', data);
	    });
	  });
  
  app.get('/wiki/edit/:id', isLoggedIn, function(req,res) {
		var q = req.params.id;
		var usx = req.user;
		var credentials = null;
		if (usx) {credentials = usx.credentials;}
		var data =  myEnvironment.getCoreUIData(req);
		data.formtitle = "Edit Topic";
		Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
			topicMapEnvironment.logDebug("Wiki.edit "+q+" "+result);
			if (result) {
				//A blog post is an AIR
				data.title = result.getSubject(constants.ENGLISH).theText;
				data.body = result.getBody(constants.ENGLISH).theText;
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