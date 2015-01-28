/**
 * admin app
 * Admin must handle login/logout/admin
 */
var User = require('../core/user'),
    constants = require('../core/constants'),
    adminmodel = require('../apps/admin/adminmodel'),
    proxy = require('tqtopicmap/lib/models/subjectproxy'),
    usermodel = require('../apps/user/usermodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var topicMapEnvironment = environment.getTopicMapEnvironment(),
        myEnvironment = environment,
        Dataprovider = topicMapEnvironment.getDataProvider(),
        userDatabase = environment.getUserDatabase(),
        UserModel = new usermodel(environment),
        passport = ppt,
        AdminModel = new adminmodel(environment),
        isInvitationOnly = environment.getIsInvitationOnly();
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
	// View Selection
	// Here since Admin is always an app in a system
	// Otherapps can do the same to switch a view that is live
	///////////////
	app.get("/admin,setview/:id", function(req,res) {
		var q = req.params.id;
		console.log("Admin.setView "+q);
		req.session.viewtype = q;
		res.redirect('/');
	});
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
			return res.render('signup', data);
		});
	});
	
	/**
	 * Utility for post
	 */
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
			} else {
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
							console.log('Usererror '+err);
							return res.redirect('/error/SignupError');
						} else {
							console.log('User: ' + xuser.getEmail() + " saved.");
							//now create a topic for this user
							UserModel.newUserTopic(xuser,function(err, result) {
								console.log('ROUTES.signup '+err+" "+result);
								if (err) {
									console.log('ROUTES.signup/post error '+err);
									return res.redirect('/error/SignupError');
								} else {
									return res.redirect('/');
								}
							});
						}	
					});
				});				
			}
		});
	};
  
	app.post('/signup', function(req,res) {
		var email = req.body.email;
		console.log("Admin.signup "+isInvitationOnly+" "+email);
		if (isInvitationOnly) {
			AdminModel.hasInvitation(email, function(err, truth) {
				console.log("Admin.signup-1 "+truth);
				if (truth) {
					AdminModel.removeInvitation(email, function(err, truth) {
						console.log("Admin.signup-4 ");
						return __doPostSignup(req,res);
					});
				} else {
					console.log("Admin.signup-3 ");
					return res.redirect('/error/InvitationRequired');
				}
			});
		} else {
			console.log("Admin.signup-5 ");
			return __doPostSignup(req, res);
    	}
	});

  ///////////////////////////////
  // Admin functions
  ///////////////////////////////
  app.get('/admin', isAdmin, function(req, res) {
	return res.render('admin',environment.getCoreUIData(req));
  });
  app.get('/admin/setmessage', isAdmin, function(req,res) {
	  var msg = req.query.message;
	  environment.setMessage(msg);
	  return res.redirect('/admin');
  });
  app.get('/clearmessage', isAdmin, function(req,res) {
	  environment.clearMessage();
	  return res.redirect('/admin');
  });
  app.get('/saverecents', isAdmin, function(req,res) {
	  environment.persistRecents();
	 return res.redirect('/admin');
  });
  app.get('/importdb', isAdmin, function(req, res) {
	return res.render('admin',environment.getCoreUIData(req)); //TODO
  });
  app.get('/exportdb', isAdmin, function(req, res) {
	res.render('admin'); //TODO
  });
  
  app.get('/inviteuser', isAdmin, function(req, res) {
	return res.render('inviteuser',environment.getCoreUIData(req));
  });
  
  app.post('/inviteuser', isAdmin, function(req,res) {
	var email = req.body.email;
	  console.log("ABC "+JSON.stringify(req.body));
	  console.log("DEF "+JSON.stringify(req.query));
	AdminModel.addInvitation(email, function(err,data) {
		console.log("Admin.inviteUser "+email+" "+err+" "+data);
		return res.redirect('/admin');
	});
  });

 
  app.get('/listusers', isAdmin, function(req, res) {
	AdminModel.fillDatatable(function(json) {
		console.log("AdminModel.listUsers "+json);
		var data = environment.getCoreUIData(req);
		data.usrtable = json.data;
		return res.render('listusers',data); 
	});
  });

  app.get('/selectuser', isAdmin, function(req, res) {
	var email = req.query.email;
	console.log("Admin.selectuser "+email);
	AdminModel.getUser(email, function(err, data) {
		console.log("Admin.selectuser-1 "+err+" "+data);
		if (data) {
			var d = environment.getCoreUIData(req)
			d.email = data.email;
			d.credentials = data.credentials;
			return res.render('editcredentials',d);
		} else {
			return res.redirect('/error/NoSuchEmail');
		}
	});
  
  });
  
  app.get('/removeuser', isAdmin, function(req,res) {
		var email = req.query.email;
		console.log("Admin.selectuser "+email);
		AdminModel.removeUser(email, function(err,data) {
			return res.redirect('/admin');
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
	AdminModel.getUser(email, function(err, data) {
//		console.log("AX1 "+JSON.stringify(data));
		if (data) {
			data.credentials = nc;
	//		console.log("AX2 "+JSON.stringify(data));
			AdminModel.updateUser(data,function(err,data) {
				console.log('Admin,editcredentials-1 '+err);
				return res.redirect('/admin');		
			});
		} else {
			return res.redirect('/error/NoSuchEmail');
		}
	});
	  
  });
  /////////////////////////////////
  // Node Editing -- very dangerous
  /////////////////////////////////
    /**
     * Fired by Admin panel button
     */
  app.get('/editnode', isAdmin, function(req,res) {
    var data = environment.getCoreUIData(req);
    res.render('adminnodeedit', data);
  });
    
  app.get('/choosenode', isAdmin, function(req,res) {
      //It's interesting that req.query works on this one
     // var foo = req.body;
     // if (foo) {
     //     console.log("FOO "+JSON.stringify(foo));
     // }
     // var bar = req.query;
     // if (bar) {
     //   console.log("BAR "+JSON.stringify(bar));
     // }
      var locator = req.query.locator;
      console.log("Admin.choosenode "+locator);
      var creds = req.body.credentials;
      Dataprovider.getNodeByLocator(locator,creds,function(err,ndx) {
        console.log("BAR "+err+" "+ndx.toJSON());
          var data = environment.getCoreUIData(req);
          data.locator = locator;
          data.json = ndx.toJSON();
          return res.render('nodeeditform',data);
      });
	  
  });
  app.post('/updatenode', isAdmin, function(req,res) {
      //it's interesting that req.body works on this one
//     var foo = req.body;
//      if (foo) {
//          console.log("FOO "+JSON.stringify(foo));
//      }
//      var bar = req.query;
//      if (bar) {
//        console.log("BAR "+JSON.stringify(bar));
 //     }
	var locator = req.body.locator;
	var json = req.body.body;
      var node,
          error,
          data = myEnvironment.getCoreUIData(req);
     // console.log("BAR "+json);
      try {
          var jo = JSON.parse(json);
     //     console.log("FOO "+jo);
          node = new proxy(jo);
          node.setLastEditDate(new Date());
          console.log(" BAH "+node.toJSON()); // this works!
      } catch (e) {
          console.log("GAK "+e);
          myEnvironment.logError("Admin.postUpdateNode-1 "+err);
           return res.render('500', data);
      }
        Dataprovider.putNode(node, function(err,dx) {
          if (err) {
              myEnvironment.logError("Admin.postUpdateNode-2 "+err);
              console.log("GOK "+err);
              data.errormessage = err;
              return res.render('500', data);
              
          }
            return res.redirect("/admin");
        });
  });

};