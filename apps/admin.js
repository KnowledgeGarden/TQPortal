/**
 * admin app
 * Admin must handle login/logout/admin
 */
var User = require('../core/user')
  , constants = require('../core/constants')
  , adminmodel = require('./admin/adminmodel')
  , usermodel = require('./user/usermodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var userDatabase = environment.getUserDatabase();
	var UserModel = new usermodel(environment);
	var passport = ppt;
	var AdminModel = new adminmodel(environment);
	var isInvitationOnly = environment.getIsInvitationOnly();
	console.log("Starting Admin ");

	function isAdmin(req,res,next) {
		console.log("FIX "+constants.ADMIN_CREDENTIALS);
		console.log("FIXx "+constants.ENGLISH);
		// must be authenticated
		if (req.isAuthenticated()) {
			var usx = req.user;
			var creds = usx.credentials;
			console.log("Admin.isAdmin "+creds.length+" "+creds);
			for(var i=0;i<creds.length;i++) {
				console.log("Admin.isAdmin-1 "+creds[i]+" "+constants.ADMIN_CREDENTIALS);
				if (creds[i].trim() === constants.ADMIN_CREDENTIALS) {
					next();
					return;
				}
			}
		}
		res.redirect('/');
	}
	
	function isPrivate(req,res,next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {return next();}
			res.redirect('/login');
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
		res.redirect('/');
	}
	///////////////
	// LOGOUT
	///////////////
	app.get('/logout', function(req, res) {
		req.session.clipboard = "";
		req.logout();
		res.redirect('/');
	});

	///////////////
	// login
	///////////////
	app.get('/login', function(req, res) {
		res.render('login', environment.getCoreUIData(req));
	});
  
	app.post('/login', function(req, res, next) {
		console.log('Login: '+req.body.email);
		var bugfix = false;
		//Do the authentication using passport local strategy
		passport.authenticate('local', function(err, user, info) {
			console.log('Login2: '+err+' '+user+' '+info);
			
			//in node_modules/passport/middleware/authenticate.js
			// there is a strange event in which, if the authentication
			// succeeds, it makes more than one callback to here, the second
			// one arriving after the response train has left the station.
			//The bug could be in the way I am calling, or something else,
			// but this fix stops that.  All other "bad user" issues
			// work just fine
			if (bugfix) {return;}
		
			bugfix = true;
			if (info) {
				console.log('Login22: '+JSON.stringify(info));
			}
			//BAD PASSWORD
			//Login2: null false [object Object]
			//Login22: {"message":"Invalid password"}
			//NO SUCH USER
			//Login2: null false [object Object]
			//Login22: {"message":"Unknown user joe@sixpack.com"}
			if (err) {
				return next(err);
			}
			if (info) {
				//this could be anything contained in the message in info
				return res.redirect('/error/NoSuchUser');   //TODO
			}
			//Initialize a user's clipboard
			var sess = req.session;
			sess.clipboard = "";
			//Tell the session this user is logged in
			// required for "isLoggedIn" to work
			req.logIn(user, function(err) {
				if (err) {
					return next(err);
				}
				return res.redirect('/');
			});
		})(req, res, next);
	});
  
	///////////////
	//signup
	///////////////
	app.get('/signup', function(req, res){
		var data = environment.getCoreUIData(req);
		data.invitationOnly = isInvitationOnly;
		res.render('signup', data);
	});
	
	app.post('/validate', function(req, res) {
		var handle = req.body.vhandle;
		console.log("Validating "+handle);
		AdminModel.handleExists(handle, function(err,truth) {
			console.log("Validating-1 "+truth);
			var data = environment.getCoreUIData(req);
			data.invitationOnly = isInvitationOnly;
			if (!truth) {data.hndl = handle;}
			res.render('signup', data);
		});
	});
	
	var __doPostSignup = function(req, res) {
		var handle = req.body.handle;
		var email = req.body.email;
		var password = req.body.password;
		var fullname = req.body.fullname;
		if (fullname === "") {
			fullname = "no name given";
		}
		console.log("__doPostSignup "+email+' | '+
				fullname+' | '+
				handle+' | '+
				req.body.avatar+' | '+
				req.body.homepage);
		//validate handle -1
		//Sanity checks
		console.log("XXX "+email);
		if (email === "") {
			return res.redirect('/error/MissingEmail');
		}
		if (handle === "") {
			return res.redirect('/error/HandleRequired');
		}
		if (password === "") {
			return res.redirect('/error/MissingPassword');
		}
		if (handle.indexOf(" ") > -1) {
			console.log("BAD HANDLE "+handle);
			return res.redirect("/error/BadHandle");
		}
		//validate handle -2
		AdminModel.handleExists(handle, function(err,truth) {
			if (truth) {
				console.log('SIGNUP-B');
				return res.redirect('/error/HandleExists');
			}
		});
		//build a user
		var credentials = [];
		credentials.push(handle);
		console.log('SIGNUP-C');
		var xuser = new User({
			fullname : fullname,
			email   : email,
			avatar : req.body.avatar,
			homepage : req.body.homepage,
			latitude : req.body.Latitude,
			longitude : req.body.Longitude
			//leave password out; it requires a callback
			//leave handle out: set next
		});
		xuser.setHandle(handle);
		console.log('SIGNUP-XXX '+xuser.getEmail());
		xuser.setPassword(password, function (err) {
			console.log('Saving '+ JSON.stringify(xuser.getData()));
			userDatabase.save(xuser.getData(), function(err,data) {
				if(err) {
					console.log(err);
				} else {
					console.log('User: ' + xuser.getEmail() + " saved.");
					//now create a topic for this user
					UserModel.newUserTopic(xuser,function(err,result) {
						if (err) {
							console.log('ROUTES.signup/post error '+err);
							return res.redirect('/error/SignupError');
						}
					});
				}
				return res.redirect('/');
			});
		});
	};
  
  app.post('/signup', function(req,res) {
    var email = req.body.email;
    console.log("Admin.signup "+isInvitationOnly+" "+email);
	if (isInvitationOnly) {
		AdminModel.hasInvitation(email, function(err,truth) {
			console.log("Admin.signup-1 "+truth);
			if (truth) {
				__doPostSignup(req,res);
				console.log("Admin.signup-2 ");
			} else {
				console.log("Admin.signup-3 ");
				res.redirect('/');
			}
			AdminModel.removeInvitation(email, function(err,truth) {
				console.log("Admin.signup-4 ");
			});
		});
	} else {
		console.log("Admin.signup-5 ");
		__doPostSignup(req,res);
    }
    console.log("Admin.signup-6 ");

  });
  ///////////////////////////////
  // Admin functions
  ///////////////////////////////
  app.get('/admin', isAdmin, function(req, res) {
	res.render('admin',environment.getCoreUIData(req));
  });
  app.get('/admin/setmessage', isAdmin, function(req,res) {
	  var msg = req.query.message;
	  environment.setMessage(msg);
	  res.redirect('/admin');
  });
  app.get('/clearmessage', isAdmin, function(req,res) {
	  environment.clearMessage();
	  res.redirect('/admin');
  });
  app.get('/saverecents', isAdmin, function(req,res) {
	  environment.persistRecents();
	  res.redirect('/admin');
  });
  app.get('/importdb', isAdmin, function(req, res) {
	res.render('admin',environment.getCoreUIData(req)); //TODO
  });
  app.get('/exportdb', isAdmin, function(req, res) {
	res.render('admin'); //TODO
  });
  
  app.get('/inviteuser', isAdmin, function(req, res) {
	res.render('inviteuser',environment.getCoreUIData(req));
  });
  
  app.post('/inviteuser', isAdmin, function(req,res) {
	var email = req.body.email;
	  console.log("ABC "+JSON.stringify(req.body));
	  console.log("DEF "+JSON.stringify(req.query));
	AdminModel.addInvitation(email, function(err,data) {
		console.log("Admin.inviteUser "+email+" "+err+" "+data);
		res.redirect('/admin');
	});
  });

 
  app.get('/listusers', isAdmin, function(req, res) {
	AdminModel.fillDatatable(function(json) {
		console.log("AdminModel.listUsers "+json);
		var data = environment.getCoreUIData(req);
		data.usrtable = json.data;
		res.render('listusers',data); 
	});
  });

  app.get('/selectuser', isAdmin, function(req,res) {
	var email = req.query.email;
	console.log("Admin.selectuser "+email);
	AdminModel.getUser(email, function(err,data) {
		console.log("Admin.selectuser-1 "+err+" "+data);
		//TODO watch for null
		var d = environment.getCoreUIData(req)
		d.email = data.email;
		d.credentials = data.credentials;
		res.render('editcredentials',d);
	});
  
  });
  app.get('/removeuser', isAdmin, function(req,res) {
		var email = req.query.email;
		console.log("Admin.selectuser "+email);
		AdminModel.removeUser(email, function(err,data) {
			res.redirect('/admin');
		});
	  
	  });

  app.post('/editcredentials', isAdmin, function(req,res) {
	var email = req.body.email;
	var creds = req.body.credentials;
	var ic = creds.split(',');
	var nc = [];
	for (var i=0;i<ic.length;i++) {
		nc.push(ic[i].trim());
	}

	console.log('Admin,editcredentials '+email+" "+nc);
	AdminModel.getUser(email, function(err,data) {
//		console.log("AX1 "+JSON.stringify(data));
		data.credentials = nc;
//		console.log("AX2 "+JSON.stringify(data));
		AdminModel.updateUser(data,function(err,data) {
			console.log('Admin,editcredentials-1 '+err);
			res.redirect('/admin');		
		});
	});
	  
  });
};