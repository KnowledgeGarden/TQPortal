/**
 * This was a prototype for editing nodes.
 * It has been replaced by admin.js functions: choosenode and updatenode
 * This will not compile
 */
var kwb = require('../apps/kwb/kwbmodel'),
    relationlist = require('../apps/kwb/relationlist'),
    constants = require('../core/constants'),
    types = require('tqtopicmap/lib/types')
;

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        topicMapEnvironment = environment.getTopicMapEnvironment(),
        Dataprovider = topicMapEnvironment.getDataProvider();
    
	function isAdmin(req, res, next) {
		console.log("FIX "+constants.ADMIN_CREDENTIALS);
		console.log("FIXx "+constants.ENGLISH);
		// must be authenticated
		if (req.isAuthenticated()) {
			var usx = req.user;
			var creds = usx.credentials;
			console.log("Admin.isAdmin "+creds.length+" "+creds);
			for(var i=0;i<creds.length;i++) {
				console.log("Admin.isAdmin-1 "+creds[i]+" "+constants.ADMIN_CREDENTIALS);
				if (creds[i].trim() === constants.ADMIN_CREDENTIALS) {
					 return next();
				}
			}
		}
		return res.redirect('/');
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
   
	app.get('/nodeedit/:id', isAdmin, function nodeEditGet(req, res) {
		var q = req.params.id,
			credentials = req.user.credentials,
    		data = myEnvironment.getCoreUIData(req);
		// fetch the node and send its source out to nodeeditform
		Dataprovider.getNodeByLocator(q, credentials, function nodeEditGetNode(err, result) {
			if (result) {
		        data.source = result.toJSON();
		        return res.render('nodeeditform', data);
		    } else {
		    	return res.redirect('/error/NodeEditCannotDisplay');
		    }
		});
	});
    
	app.post('/nodeedit', isAdmin, function nodeEditPost(req, res) {
		var body = req.body,
			usx = req.user;
		//TODO turn json into SubjectProxy, set last edit date, and save it.
		console.log('BLOG_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
		//WARNING: this will not compile -- missing _blogsupport from blog.js
			_blogsupport(body, usx, function nodeEditSupport(err, result) {
			console.log('BLOG_NEW_POST-1 '+err+' '+result);
			return res.redirect('/');
		});
	});

};