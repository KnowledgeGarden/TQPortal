/**
 * Bookmark app
 */
var bkmrk = require('./bookmark/bookmark');

exports.plugin = function(app, environment, ppt) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
  this.BookmarkModel = new bkmrk(environment);
  console.log("Starting Bookmark "+this.BookmarkModel);
};