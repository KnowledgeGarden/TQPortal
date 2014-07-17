/**
 * Blog app
 */
var acls = require('./blog/blogmodel')
  , constants = require('../core/constants')
  , types = require('../node_modules/tqtopicmap/lib/types');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
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
	// Menu
	/////////////////
	myEnvironment.addApplicationToMenu("/blog","Blog");
  /////////////////
  // Routes
  /////////////////
  app.get('/blog', isPrivate,function(req,res) {
    res.render('blogindex',environment.getCoreUIData(req));
  });
		
		
  app.get('/blog/new', isLoggedIn, function(req,res) {
    res.render('blogform', environment.getCoreUIData(req)); //,
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
     
      var date = result.getDate();
      var data = environment.getCoreUIData(req);
      data.title = title;
      data.body = details;
      data.tags = tags;
      data.source = result.toJSON();
      data.date = date;
      data.user = userid;
      data.image = "/images/publication.png";
      console.log('BLOGrout-2 '+JSON.stringify(data));
/*NOTE: still a bug 
BLOGrout-2 {"title":"Watching the winds blow, it seems like the sun might shine,
 except that it might otherwise rain outside.","body":"But for the limits of san
ity, we should be thinking in terms of all ells failing. Otherwise, we must then
 consider what the consequences are, when compared to procrastination and sloth.
 It seems like one or the other is of great consequence to human kind.\r\n\r\nBu
t, whereas we are safe and sound here. one cannot tell what the future holds. I
prefer to think otherwise.","tags":[{"relationType":"TagCreatorRelationType","re
lationLabel":"TagCreatorRelationType","icon":"/images/tag_sm.png","locator":"Goo
d_Post_TAG","label":"Good Post"}],"date":"2014-07-09T16:11:30","user":"sammy","i
mage":"/images/publication.png"}
 */
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
      //technically, this should return to "/" since Lucene is not ready to display
      // the new post; you have to refresh the page in any case
      return res.redirect('/blog');
    });
  });
};