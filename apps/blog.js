/**
 * Blog app
 */
var acls = require('./blog/blogmodel')
  , constants = require('../core/constants')
  , types = require('../core/types');

exports.plugin = function(app, environment, ppt) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  var BlogModel = new acls(environment);
  console.log("Starting Blog "+this.BlogModel);
  
  function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
	console.log('ISLOGGED IN '+req.isAuthenticated());
    if (req.isAuthenticated())
      return next();
    // if they aren't redirect them to the home page
    // really should issue an error message
    res.redirect('/');
  }
 
  /////////////////
  // Routes
  /////////////////
  app.get('/blog', function(req,res) {
    var credentials = null; //TODO
    var start = 0; //TODO
    var count = -1; //TODO
    BlogModel.listBlogPosts(start,count,credentials,function(err,result) {
       console.log('ROUTES/blog '+err+' '+result);
      var posts = [];
      var len = result.length;
      var p;
      var m;
      for (var i = len-1;i>-1;i--) {
        p = result[i];
        m = {};
        m.locator = p.getLocator();
        //TODO we need a language param in the query
        m.label = p.getLabel(constants.ENGLISH);
        m.date = p.getDate();
        m.user = p.getCreatorId();
        posts.push(m);
      }
      var data = {};
      data['message']=posts;
      res.render('blogindex', data); //,
    });
  });
		
		
  app.get('/blog/new', isLoggedIn, function(req,res) {
    res.render('blogform', {title: 'New Article' }); //,
  });
	    
  app.get('/blog/:id', function(req,res) {
    var q = req.params.id;
    console.log('BLOGrout '+q);
    var credentials = null; //TODO
    Dataprovider.getNodeByLocator(q, credentials, function(err,result) {
      console.log('BLOGrout-1 '+err+" "+result);
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