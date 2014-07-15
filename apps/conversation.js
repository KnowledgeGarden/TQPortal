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

  app.get('/conversation/new', isLoggedIn, function(req,res) {
	  //TODO must setup a map node
	    res.render('blogform', {title: 'New Article' }); //,
  });
  
  app.get('/conversation/:id', isPrivate,function(req,res) {
	    var q = req.params.id;
	    console.log('CONVERSATIonrout '+q);
	    var credentials = null; //TODO
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('CONVERSATIonrout-1 '+err+" "+result.toJSON);
	      var title = result.getLabel(constants.ENGLISH);
	      var details = result.getDetails(constants.ENGLISH);
	      var userid = result.getCreatorId();
	      // paint tags
	      var tags = result.listRelationsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
	      console.log("Conversation.XXX "+JSON.stringify(tags));
	     
	      var date = result.getDate();
	      var data = {};
	      data.title = title;
	      data.body = details;
	      data.tags = tags;
	      data.source = result.toJSON();
	      data.date = date;
	      data.user = userid;
	      data.image = "/images/publication.png"; //todo MUST GET FROM THE NODE
	      console.log('CONVERSATIonrout-2 '+JSON.stringify(data));
	      res.render('topic', data); //todo???
	    });
	  });
  /**
   * Function which ties the app-embedded route back to here
   */
  var _consupport = function(body,usx, callback) {
    var credentials = null; //TODO
    ConversationModel.createMap(body, usx, credentials, function(err,result) {
      callback(err,result);
    });
  };
    
  app.post('/blog', isLoggedIn, function(req,res) {
    var body = req.body;
    var usx = req.user;
    console.log('BLOG_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
    _consupport(body, usx, function(err,result) {
      console.log('BLOG_NEW_POST-1 '+err+' '+result);
      //technically, this should return to "/" since Lucene is not ready to display
      // the new post; you have to refresh the page in any case
      return res.redirect('/blog');
    });
  });

};