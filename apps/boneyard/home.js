/**
 * home app -- the landing page
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  console.log("Starting Home");
  
  function isPrivate(req,res,next) {
	console.log("Home.isPrivate "+isPrivatePortal);
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
  app.get('/', isPrivate, function(req, res) {
    //changing this value allows changing landing page
    var idx = 'newindex';
    res.render(idx, { title: 'TQPortal' });
	  
  });

};