/**
 * Wiki app
 */
var wm = require('./wiki/wikimodel')
 , types = require('../node_modules/tqtopicmap/lib/types')
  , constants = require('../core/constants')
;

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  this.WikiModel = new wm(environment);
  console.log("Starting Wiki "+this.WikiModel);
  
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
	environment.addApplicationToMenu("/wiki","Wiki");
  /////////////////
  // Routes
  /////////////////
  app.get('/wiki', isPrivate,function(req,res) {
    res.render('wikihome', environment.getCoreUIData(req));
  });
  app.get('/wiki/:id', isPrivate,function(req,res) {
	  var usx = req.user;
	    var q = req.params.id;
	    console.log('WIKIrout '+q);
	    var credentials = null;
	    	if (usx) {credentials = usx.credentials;}
	    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
	      console.log('WIKIrout-1 '+err+" "+JSON.stringify(result)); //result.toJSON);
	      console.log('WIKIrout-1a '+err+" "+result.toJSON()); //result.toJSON);
	      var title = result.getLabel(constants.ENGLISH);
	      var details = result.getDetails(constants.ENGLISH);
	      var userid = result.getCreatorId();
	      // paint tags
	      var tags = result.listRelationsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
	      console.log("Wiki.XXX "+JSON.stringify(tags));
	     
	      var date = result.getDate();
	      var data = myEnvironment.getCoreUIData(req);
	      data.title = title;
	      data.body = details;
	      data.tags = tags;
	      data.source = result.toJSON();
	      data.date = date;
	      data.user = userid;
	      data.image = "/images/publication.png";
	      console.log('WIKIrout-2 '+JSON.stringify(data));
	      res.render('topic', data);
	    });
	  });
  app.post('/newtopic', isLoggedIn, function(req,res) {
	var title = req.body.title;
	console.log("Wiki.newtopic "+title);
	var p = {};
	p.title = title;
	res.render('wikiform', p);
  });
  
  /**
   * Function which ties the app-embedded route back to here
   */
  var __wikisupport = function(body,usx, callback) {
    WikiModel.create(body, usx, function(err,result) {
      callback(err,result);
    });
  };

  app.post('/wiki', isLoggedIn, function(req,res) {
	  var body = req.body;
	  var usx = req.user;
	  console.log('WIKI_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
	  __wikisupport(body, usx, function(err,result) {
	      console.log('WIKI_NEW_POST-1 '+err+' '+result);
	      //technically, this should return to "/" since Lucene is not ready to display
	      // the new post; you have to refresh the page in any case
	      return res.redirect('/wiki');
	    });
	  
  });
};