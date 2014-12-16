/**
 * New node file
 */
var mdl = require('../apps/profile/profilemodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment,
        ProfileModel = new mdl(environment)
	console.log("Profile "+ProfileModel);
	
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

	app.get("/profile", isLoggedIn, function(req,res) {
		var data = environment.getCoreUIData(req);
		var usx = req.user;
		data.email = usx.email;
		data.fullname = usx.fullname;
		data.homepage = usx.homepage;
		data.avatar = usx.avatar;
		data.latitude = usx.latitude;
		data.longitude = usx.longitude;
		res.render("profile",data);
	});
	
	app.post("/profile/update", isLoggedIn, function(req,res) {
		var body = req.body;
		var usx = req.user;
		ProfileModel.updateProfile(body,usx,function(err) {
			if (err) {
				res.redirect('/error/'+err);
			} else {
				res.redirect('/');
			}
		});
		
	});
};