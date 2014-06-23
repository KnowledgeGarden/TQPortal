/**
 * routes
 * Idea from:
 * http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local
 */
var home = require('./index')
  , admin = require('./admin')
  , user  = require('./user')
  , login = require('./login')
  , blogindex = require('./blogindex')
  , blog = require('./blog')
  , tag = require('./tag')
  , matrix = require('./matrix')
  , signup = require('./signup')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , User = require('../apps/models/account')
  , userModel = require('../apps/models/user')
  , acls = require('../apps/models/articles')
  , auth = require('./auth/authorization')
  , Topic = require('../apps/models/topic')
  , types = require('../apps/types')
  , LocalStrategy = require('passport-local').Strategy;
	
var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
var commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

module.exports = function(app, passport) {
	this.BlogModel = new acls();
	this.UserModel = new userModel();
	console.log("ROUTER "+this.BlogModel);

	
    // =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', home.index);  	//look for index.handlebars
	// =====================================
	// Admin ===============================
	// =====================================
	app.get('/admin', admin.admin); //look for admin.handlebars
	// =====================================
	// Users ===============================
	// =====================================
	app.get('/users', user.list);
  // =====================================
  // Blog ===============================
  // =====================================

  app.get('/blog', function(req,res) {
		
    Topic.listNodesByType(types.BLOG_TYPE, function(err,result) {
      console.log('ROUTES/blog '+err+' '+result);
      //TODO
      // Reverse the order of these results
      var posts = [];
      var len = result.length;
      for (var i = len-1;i>-1;i--) {
    	  posts.push(result[i]);
      }
      var data = {};
      data['message']=posts;
      res.render('blogindex', data); //,
    });		
  });
	
	app.get('/matrix', matrix.matrix);
	
    app.get('/blog/new', auth.requiresLogin, function(req,res) {
            res.render('blogform', {title: 'New Article' }); //,
    });
    
  app.get('/blog/:id', function(req,res) {
    	var q = req.params.id;
    	console.log('BLOGrout '+q);
    	Topic.findNodeByLocator(q, function(err,result) {
        	console.log('BLOGrout-1 '+result);
    		var title = result.label;
    		var details = result.details;
    		var userid = result.creatorId;
    		var relns = result.relations;
    		var tags;
    		var len = relns.length;
    		if (len > 0) {
    			var r;
    			tags = [];
    			for (var i=0;i<len;i++) {
    				r = relns[i];
    				if (r.relationType === types.TAG_DOCUMENT_RELATION_TYPE) {
    					//TODO
    				}
    			}
    		}
    		var date = result.editedAt;
    		var data = {};
    		data.title = title;
    		data.body = details;
        	console.log('BLOGrout-2 '+JSON.stringify(data));
   		
            res.render('blog', data); //,
    		
    	});
  });
    
    /**
     * Function which ties the app-embedded route back to here
     */
    var blogsupport = function(body,usx, callback) {
    	this.BlogModel.create(body, usx, function(err,result) {
    		callback(err,result);
    	});
    };
    
    app.post('/blog', auth.requiresLogin, function(req,res) {
    	var body = req.body;
    	console.log('ROUTES_NEW_POST '+this.BlogModel+' '+JSON.stringify(body));
    	
    	blogsupport(body, req.user, function(err,result) {
    		console.log('ROUTES_NEW_POST-1 '+err+' '+result);
    		return res.redirect('/blog');
    	});
    	
    });
  // =====================================
  // Tags ===============================
  // =====================================

  app.get('/tag/:id', function(req,res) {
    var q = req.params.id;
    console.log('TAGroute '+q);
    Topic.findNodeByLocator(q, function(err,result) {
      console.log('TAGroute-1 '+result);
      var title = result.label;
      var details = result.details;
      var userid = result.creatorId;
      var relns = result.relations;
      var date = result.editedAt;
      var data = {};
      data.title = title;
      data.body = details;
      console.log('TAGroute-2 '+JSON.stringify(data));
   		
      res.render('tag', data); //,
    		
      });
   });

		
		
		
  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  app.get('/login', login.login);
  
  app.post('/login', function(req, res, next) {
    console.log('Login: '+req.body.username);
    passport.authenticate('local', function(err, user, info) {
      console.log('Login2: '+err+' '+user+' '+info);
      if (err) { return next(err); }
      if (!user) {
        return res.redirect('/NoSuchUser');   //TODO
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/');
      });
    })(req, res, next);
  });
  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get('/signup', signup.signup);
  
  app.post('/signup', function(req,res) {
    var handle = req.body.handle;
    console.log(req.body.email+' | '+
      req.body.fullname+' | '+
      handle+' | '+
      req.body.avatar+' | '+
      req.body.homepage+' | '+
      req.body.password);
    //validate handle
    if (handle == "") {
      return res.redirect('/HandleRequired');
    }
    Topic.findNodeByLocator(handle, function(err, result) {
    	console.log('SIGNUP-x '+result);
    	//if (result !== null) {
       	if (result !== null && result.length > 0) {
        	console.log('SIGNUP-B');
    	     return res.redirect('/HandleExists');
    	}
    	console.log('SIGNUP-C');
        var user = new User({ 
            username : req.body.handle, 
            fullname : req.body.fullname,
            email   : req.body.email,
            avatar : req.body.avatar,
            homepage : req.body.homepage,
            password : req.body.password //TODO storing raw password
        });
        console.log('Saving '+user+' '+user.email);
        user.save(function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log('User: ' + user.email + " saved.");
              //now create a topic for this user
              UserModel.newUserTopic(user,function(err,result) {
            	  if (err) {
            		  console.log('ROUTES.signup/post error '+err);
            		  return res.redirect('/SignupError');
            	  }
              });
            }
            return res.redirect('/');
          });
    });
  });
	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}