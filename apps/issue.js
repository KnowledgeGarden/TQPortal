/**
 * IssueApp
 * This is the portal of entry into a Game system.
 * <ul>
 * <li>Issues are the primary element</li>
 * <li>Quests form around issues</li>
 * <li>Guilds form to go on quests</li>
 * <li>Avatars participate in guilds</li>
 * </ul>
 */
var issue = require('./issue/issuemodel')
  , constants = require('../core/constants')
 , types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var IssueModel = new issue(environment);
	var __landingPageLocator = "gtilanding";
	
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
	environment.addApplicationToMenu("/issue","Issue");
	  /////////////////
	  // Routes
	  /////////////////
	  app.get('/issue', isPrivate,function(req,res) {
		  var data = myEnvironment.getCoreUIData(req);
		  //We can change the brand
		  data.brand = "GetTheIssues";
		  data.query = "/landing/"+__landingPageLocator;
		  data.type = "landing";
	    res.render('issuehome',data);
	  });
	  
	  

};