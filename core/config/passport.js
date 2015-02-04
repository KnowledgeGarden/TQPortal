/**
 * Passport configuration
 */
var LocalStrategy = require('passport-local').Strategy,
    constants = require('../constants'),
    Ux = require('../user')
;

module.exports = function (passport, userdb) {
	console.log('PASSPORT-PRE '+passport);
  ///////////////////////////////
  // Probably much more secure ways to do this??
  ///////////////////////////////
  /**
   * Serialize <code>user</code> to a string for a cookie
   * @param user
   */
  passport.serializeUser(function(user, done) {
    //This takes a user passed in from the database; we crash if it is empty or corrupted
	  console.log('passport.serializeUser '+JSON.stringify(user));
	  console.log('passport.serializeUser-1 '+user.email);
    return done(null, user.email);
  });

  /**
   * Find a user based on <code>email</code> from a cookie
   * @param email
   */
  passport.deserializeUser(function(email, done) {
	  userdb.findOne(email, function passportFindONe(err, user) {
//    	console.log('passport.deserializer '+email+' '+user);
      return done(err, user);
    });
  });

  passport.use(new LocalStrategy({
                    usernameField: 'email', passwordField: 'password'},
                    function passportUse(email, password, done) {
    console.log('LOGINSTART '+email+" is trying to login as local.");
    userdb.findOne(email, function passportFindONe1(err, puser) {
      //NOTE: puser is a JSON object
      console.log('LOGINSTART-1 '+err+' | '+puser);
      if(!puser){
        console.log("user not found.");
        return done(err, false, { message: 'Unknown user ' + email });
      }
      console.log(puser);
      console.log(puser.email+' '+puser.password);
      var User = new Ux(puser);
      console.log('LOGINNEXT '+JSON.stringify(User.getData()));
      User.comparePassword(password, function passportCompare(err, isMatch) {
        console.log('LOGINNEXT-1 '+err+' '+isMatch);
        if (err) return done(err);
        if(isMatch) {
          return done(err, User);
        } else {
          return done(err, false, { message: 'Invalid password' });
        }
      });
	            //if (password!==puser.password) {
	            //	console.log("password invalid. "+puser.password);
	            //    return done(null, false, { message: 'Invalid password' });
	            //}
      return done(err, puser);
    });
  })); 

};