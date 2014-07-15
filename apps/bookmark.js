/**
 * Bookmark app
 * javascript:location.href='http://<serverurl>/bkmrk?url='+           
 *   encodeURIComponent(location.href)+'&title='+         
 *   encodeURIComponent(document.title)
 */
var bkmrk = require('./bookmark/bookmarkmodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  this.BookmarkModel = new bkmrk(environment);
  console.log("Starting Bookmark "+this.BookmarkModel);
  
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

  app.get('/bkmrk', isPrivate, function(req,res) {
	  res.render('bookmarkindex');
  });

};