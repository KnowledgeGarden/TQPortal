/**
 * New node file
 */
var conmodel = require('./conversation/conversationmodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
  var topicMapEnvironment = environment.getTopicMapEnvironment();
  var Dataprovider = topicMapEnvironment.getDataProvider();
  var ConversationModel = new conmodel(environment);
  console.log("Conversation started");
	
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
  app.get('/conversation', isPrivate, function(req,res) {
    res.render('conversationindex');
  });

};