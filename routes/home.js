/**
 * New Home app
 * This one shows recent events
 */
var home = require('../apps/home/homemodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        HomeModel = new home(environment);
  console.log("Starting Home "+HomeModel);
  
  function isPrivate(req,res,next) {
	  console.log("BOOTING HOME");
  	console.log("Home.isPrivate "+isPrivatePortal);
      if (isPrivatePortal) {
        if (req.isAuthenticated()) {return next();}
        return res.redirect('/login');
  	} else {
  		return next();
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
  	return res.redirect('/');
  }
	
  function __get(request) {
	  return myEnvironment.getCoreUIData(request);
  }
  /////////////////
  // Routes
  /////////////////
  app.get('/', isPrivate, function homeGet(req, res) {
    //changing this value allows changing landing page
	  var sess = req.session;
	//console.log("CLIPBOARD: "+sess.clipboard);
    var idx = 'recenthome';
    var data = __get(req);
    data.pageref="/admin/dashboardview";
    data.treeref="/admin/treeview";
    data.tags = HomeModel.listRecentTags();
    data.blogs = HomeModel.listRecentBlogs();
    data.wikis = HomeModel.listRecentWikis();
    data.conv = HomeModel.listRecentConversations();
    data.bkmks = HomeModel.listRecentBookmarks();
    //console.log("GETHOME "+JSON.stringify(data));
    return res.render(idx, data);
	  
  });
};