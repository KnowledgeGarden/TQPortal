/**
 * topicmap
 */

var tm = require("../apps/topicmap/topicmapmodel");

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var TopicMapModel = new tm(environment);
	console.log("TopicMap "+TopicMapModel);
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/topicmap","TopicMap");

	app.get("/topicmap", function(req, res) {
		var data = environment.getCoreUIData(req);
		res.render("topicmaphome", data);
	});
};