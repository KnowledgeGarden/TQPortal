/**
 * admin app
 * Admin must handle login/logout/admin
 */
var User = require('../core/user')
  , usermodel = require('./user/usermodel');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
	var userDatabase = environment.getUserDatabase();
	var UserModel = new usermodel(environment);
	var passport = ppt;
	console.log("Starting Admin");
	
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
///////////////
// login
///////////////
  app.get('/login', function(req, res) {
    res.render('login', { title: 'Login' });
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
      if (bugfix)
    	  return;
      bugfix = true;
      if (info)
          console.log('Login22: '+JSON.stringify(info));
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
        return res.redirect('/NoSuchUser');   //TODO
      }
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
    res.render('Signup', { title: 'Signup' });
  });
 
  app.post('/signup', function(req,res) {
    var handle = req.body.handle;
    console.log(req.body.email+' | '+
      req.body.fullname+' | '+
      handle+' | '+
      req.body.avatar+' | '+
      req.body.homepage+' | '+
      req.body.password);
    //validate handle
    if (handle === "") {
      return res.redirect('/HandleRequired');
    }
    var credentials = null; //TODO
    Dataprovider.getNodeByLocator(handle, credentials,function(err, result) {
      console.log('SIGNUP-x '+result);
      //if (result !== null) {
      if (result && result !== null && result.length > 0) {
        console.log('SIGNUP-B');
        return res.redirect('/HandleExists');
      }
      console.log('SIGNUP-C');
      var xuser = new User({
        handle : req.body.handle,//note: handle is username: must be unique
        fullname : req.body.fullname,
        email   : req.body.email,
        avatar : req.body.avatar,
        homepage : req.body.homepage,
        //leave password out; it requires a callback
      });
      console.log('SIGNUP-XXX '+xuser.getEmail());
      xuser.setPassword(req.body.password, function (err) {
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
              return res.redirect('/SignupError');
            }
          });
        }
        return res.redirect('/');
        });
      });
    });
  });
};