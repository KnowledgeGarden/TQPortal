/**
 * Passport configuration
 */
var LocalStrategy = require('passport-local').Strategy
  , User = require('../apps/models/account');

module.exports = function (passport) {
	console.log('PASSPORT-PRE '+passport);
  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({
	    usernameField: 'email',
	    passwordField: 'password'
	  }, function(email,password,done) {
	    console.log('STRAT '+email+" | "+password+" is trying to login as local.");
		//var User = mongoose.model('User');
	    User.findOne({'email':email}, function(err,puser) {
	            console.log(err+' | '+puser);
	            if(!puser){
	            	console.log("user not found.");
	                return done(null, false, { message: 'Unknown user ' + email });
	            }
	            console.log(puser);
	            console.log(puser.email+' '+puser.password);
	            puser.comparePassword(password, function(err, isMatch) {
	            	console.log('A '+err);
	                if (err) return done(err);
	                if(isMatch) {
	                  return done(null, User);
	                } else {
	                  return done(null, false, { message: 'Invalid password' });
	                }
	              });
	            //if (password!==puser.password) {
	            //	console.log("password invalid. "+puser.password);
	            //    return done(null, false, { message: 'Invalid password' });
	            //}
	            return done(null, puser);
	    });
	})); 

};