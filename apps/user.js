/**
 * User app
 */
var userModel = require('./user/usermodel')
  , constants = require('../core/constants')
 , types = require('../node_modules/tqtopicmap/lib/types');


exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var UserModel = new userModel(environment);
  console.log("Starting User "+UserModel);
  //TODO lots!
	var self = this;
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
	environment.addApplicationToMenu("/user","User");
  /////////////////
  // Routes
  /////////////////
  app.get('/user', isPrivate,function(req,res) {
    res.render('userindex',myEnvironment.getCoreUIData(req));
  });
		
  app.get('/user/edit/:id', isLoggedIn, function(req,res) {
		var q = req.params.id;
		var usx = req.user;
		var credentials = null;
		if (usx) {credentials = usx.credentials;}
		var data =  myEnvironment.getCoreUIData(req);
		Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
			topicMapEnvironment.logDebug("User.edit "+q+" "+result);
			if (result) {
				if (result.getBody(constants.ENGLISH)) {
					data.body = result.getBody(constants.ENGLISH).theText;
				}
				data.locator = result.getLocator();
			}
			res.render('userform', data); //,
		});
	  });
  
  var _usersupport = function(body,usx, callback) {
	var credentials = usx.credentials;
	  UserModel.update(body, usx, credentials, function(err,result) {
          callback(err,result);
      });

  }
  app.post('/user', isLoggedIn, function(req,res) {
	var body = req.body;
	var usx = req.user;
	console.log('USER_EDIT '+JSON.stringify(usx)+' | '+JSON.stringify(body));
	_usersupport(body, usx, function(err,result) {
	console.log('USER_EDIT-1 '+err+' '+result);
		return res.redirect('/user');
	});

  });
  
  
  app.get('/user/:id', isPrivate,function(req,res) {
	var q = req.params.id;
	console.log('USERrout '+q);
	var credentials = null;
    var usr = req.user;
    if (usr) { credentials = usr.credentials;}
	Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
		console.log('USERrout-1 '+err+" "+result);
		var title = result.getSubject(constants.ENGLISH).theText;
		
		var userid = result.getCreatorId();
		// paint tags
		var tags = result.listRelationsByRelationType(types.TAG_CREATOR_RELATION_TYPE); //types.TAG_DOCUMENT_RELATION_TYPE);
		// paint docs
		var docs = result.listRelationsByRelationType(types.CREATOR_DOCUMENT_RELATION_TYPE);
		var date = result.editedAt;
		var data = myEnvironment.getCoreUIData(req);
  	    var canEdit = self.canEdit(result,credentials);
  	    data.canEdit = canEdit;
	    data.editLocator = "/user/edit/"+result.getLocator();
 	    if (result.getResourceUrl()) {
  	    	data.url = result.getResourceUrl();
   	    }

		data.title = title;
		if (result.getBody(constants.ENGLISH)) {
			data.body = result.getBody(constants.ENGLISH).theText;
		}
		data.tags = tags;
		data.docs = docs;
		data.source = result.toJSON();
		data.date = date;
		data.image = "/images/person.png";
		//TODO paint provenance creator Id setup to point to user
		console.log('USERrout-2 '+JSON.stringify(data));
		res.render('topic', data);
	});
  });

};