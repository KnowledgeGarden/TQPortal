/**
 * User data provider for mongoose
 * Idea from:
 * http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local
 * http://mherman.org/blog/2013/11/11/user-authentication-with-passport-dot-js/#.U5DYYCiiUQo
 * https://github.com/jaredhanson/passport-local/blob/master/examples/express3-mongoose/app.js
 * TODO add the rest of the user methods to this
 */
var mongoose = require('mongoose')
  , bcrypt   = require('bcryptjs')
  , Schema = mongoose.Schema
  , passportLocalMongoose = require('passport-local-mongoose')
  , SALT_WORK_FACTOR = 10;


//define the schema for our user model
var Account = Schema ({
  username     : String, //actually handle
  password     : String,
  fullname	 : String,
  email  	 : String,
  avatar		 : String,
  homepage	 : String,
  credentials  : Array,
  salt		 : String
});

Account.plugin(passportLocalMongoose);

//Password verification
Account.methods.comparePassword = function(candidatePassword, cb) {
  var user = this;
//  console.log('Account.comparePassword '+candidatePassword+' '+user.password);
  bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};
//Bcrypt middleware
Account.pre('save', function(next) {
  console.log('Account.pre');
  var user = this;

  if(!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if(err) return next(err);
        user.password = hash;  //turns password into hash
        next();
      });
    });
});

// create the model for users and expose it to our app
var User = module.exports = mongoose.model('User', Account);
