/**
 * tag app
 */
var tagModel = require('./tag/tagmodel')
  , constants = require('../core/constants')
  , types = require('../core/types');


exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
//  this.TagModel = new userModel(environment);

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
	// Routes
	/////////////////
	app.get('/tag', isPrivate,function(req,res) {
		res.render('tagindex');
	});
		
	app.get('/tag/:id', isPrivate,function(req,res) {
		var q = req.params.id;
		console.log('TAGrout '+q);
		var credentials = null; //TODO
		Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
			console.log('TAGrout-1 '+err+" "+result);
			var title = result.getLabel(constants.ENGLISH);
			var details = result.getDetails(constants.ENGLISH);
			var userid = result.getCreatorId();
			// paint docs
			var docs = result.listRelationsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
	//		console.log("Tags.XXX "+JSON.stringify(docs));
			// paint users
			var users = result.listRelationsByRelationType(types.TAG_CREATOR_RELATION_TYPE);
			var date = result.editedAt;
			var data = {};
			data.title = title;
			data.body = details;
			data.docs = docs;
			data.users = users;
			data.date = date;
			data.source = result.toJSON();
			data.image = "/images/tag.png";
			//TODO paint provenance creator Id setup to point to user
			console.log('TAGrout-2 '+JSON.stringify(data));
			res.render('topic', data);
		});
	});
  
};