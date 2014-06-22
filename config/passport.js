/**
 * Passport configuration
 */
var LocalStrategy = require('passport-local').Strategy
  , mongoose = require('mongoose')
  , User = mongoose.model('User');

module.exports = function (passport) {
	console.log('PASSPORT-PRE '+passport);
  ///////////////////////////////
  // Probably much more secure ways to do this??
  ///////////////////////////////
  /**
   * Serialize <code>user</code> to a string for a cookie
   * @param user
   */
  passport.serializeUser(function(user, done) {
//	  console.log('passport.serializeUser '+user.email);
    done(null, user.email);
  });

  /**
   * Find a user based on <code>email</code> from a cookie
   * @param email
   */
  passport.deserializeUser(function(email, done) {
    User.findOne({ email: email }, function (err, user) {
 //   	console.log('passport.deserializer '+email+' '+user);
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