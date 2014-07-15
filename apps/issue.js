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
  , types = require('../core/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var IssueModel = new issue(environment);
	
	
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
	  app.get('/issue', isPrivate,function(req,res) {
	    res.render('issuehome');
	  });

};