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
					next();
					return;
				}
			}
		}
		res.redirect('/');
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
   
  app.get('/nodeedit/:id', isAdmin,function(req, res) {
	var q = req.params.id,
        credentials = req.user.credentials;
    
	var data = myEnvironment.getCoreUIData(req);
	//myEnvironment.logDebug("BLOGGY "+JSON.stringify(req.query));
      // fetch the node and send its source out to nodeeditform
	Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
        data.source = result.toJSON();
        return res.render('nodeeditform',data);
	});
  });
    
  app.post('/nodeedit', isAdmin, function(req,res) {
    var body = req.body;
    var usx = req.user;
      //TODO turn json into SubjectProxy, set last edit date, and save it.
    console.log('BLOG_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
    _blogsupport(body, usx, function(err,result) {
      console.log('BLOG_NEW_POST-1 '+err+' '+result);
      //technically, this should return to "/" since Lucene is not ready to display
      // the new post; you have to refresh the page in any case
      return res.redirect('/blog');
    });
  });

};