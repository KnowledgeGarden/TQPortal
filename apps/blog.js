/**
 * Blog app
 */
var acls = require('./blog/blogmodel')
  , constants = require('../core/constants')
  , types = require('../core/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var BlogModel = new acls(environment);
	console.log("Starting Blog "+this.BlogModel);
  
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
  app.get('/blog', isPrivate,function(req,res) {
    res.render('blogindex');
  });
		
		
  app.get('/blog/new', isLoggedIn, function(req,res) {
    res.render('blogform', {title: 'New Article' }); //,
  });

  app.get('/blog/:id', isPrivate,function(req,res) {
    var q = req.params.id;
    console.log('BLOGrout '+q);
    var credentials = null; //TODO
    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
      console.log('BLOGrout-1 '+err+" "+result.toJSON);
      var title = result.getLabel(constants.ENGLISH);
      var details = result.getDetails(constants.ENGLISH);
      var userid = result.getCreatorId();
      // paint tags
      var tags = result.listRelationsByRelationType(types.TAG_DOCUMENT_RELATION_TYPE);
      console.log("Blogs.XXX "+JSON.stringify(tags));
     
      var date = result.editedAt;
      var data = {};
      data.title = title;
      data.body = details;
      data.tags = tags;
      data.date = date;
      data.image = "/images/publication.png";
      //TODO paint provenance creator Id setup to point to user
      console.log('BLOGrout-2 '+JSON.stringify(data));
      res.render('topic', data);
    });
  });

  /**
   * Function which ties the app-embedded route back to here
   */
  var _blogsupport = function(body,usx, callback) {
    var credentials = null; //TODO
    BlogModel.create(body, usx, credentials, function(err,result) {
      callback(err,result);
    });
  };
    
  app.post('/blog', isLoggedIn, function(req,res) {
    var body = req.body;
    var usx = req.user;
    console.log('BLOG_NEW_POST '+JSON.stringify(usx)+' | '+JSON.stringify(body));
    _blogsupport(body, usx, function(err,result) {
      console.log('BLOG_NEW_POST-1 '+err+' '+result);
      return res.redirect('/blog');
    });
  });
};