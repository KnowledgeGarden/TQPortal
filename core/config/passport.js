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
	//  console.log('passport.serializeUser-1 '+user.email);
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
      console.log('LOGINSTART-1 '+err+' | '+puser);
      if (err) { return done(err); }
      //What is critical here is any error must return just a new Error and nothing else
      if (!puser) { return done(new Error("NoSuchUser")); }
      var User = new Ux(puser);
      console.log('LOGINSTART-2 '+JSON.stringify(User.getData()));
      var isMatch = User.comparePassword(password);
      console.log('LOGINSTART-3 '+isMatch);
      if (!isMatch) { console.log("ARRRRG"); return done(new Error("BadPassword")); }
      return done(null, puser);
    });
  })); 

};