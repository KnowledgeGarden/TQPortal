/**
 * User app
 */
var userModel = require('./user/usermodel');

exports.plugin = function(app, environment, ppt) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  this.UserModel = new userModel(environment);
  console.log("Starting User "+this.UserModel);
  //TODO lots!
  function isLoggedIn(req, res, next) {
	    // if user is authenticated in the session, carry on 
		console.log('ISLOGGED IN '+req.isAuthenticated());
	    if (req.isAuthenticated()) {return next();}
	      
	    // if they aren't redirect them to the home page
	    // really should issue an error message
	    res.redirect('/');
	  }
  /////////////////
  // Routes
  /////////////////
  app.get('/user', function(req,res) {
    res.render('userindex');
  });
		
  app.get('/user/:id', function(req,res) {
	    var q = req.params.id;
	    console.log('USERrout '+q);
	    var credentials = null; //TODO
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('USERrout-1 '+err+" "+result);
	      var title = result.getLabel(constants.ENGLISH);
	      var details = result.getDetails(constants.ENGLISH);
	      var userid = result.getCreatorId();
	      // paint tags
	      var tags = result.listRelationsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
	      
	      var date = result.editedAt;
	      var data = {};
	      data.title = title;
	      data.body = details;
	      data.tags = tags;
	      data.date = date;
	      data.image = "/images/person.png";
	      //TODO paint provenance creator Id setup to point to user
	      console.log('USERrout-2 '+JSON.stringify(data));
	      res.render('topic', data);
	    });
	  });

};