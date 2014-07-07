/**
 * Wiki app
 */
var wm = require('./wiki/wiki');

exports.plugin = function(app, environment, ppt) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  this.WikiModel = new wm(environment);
  console.log("Starting Wiki "+this.WikiModel);
};