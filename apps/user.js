/**
 * User app
 */
var userModel = require('./user/usermodel');

exports.plugin = function(app, environment, ppt) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  this.UserModel = new userModel(environment);
  console.log("Starting User "+this.UserModel);
  //TODO lots!
};