/**
 * timeview
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/timeview","Time");

	app.get("/timeview", function timeviewGet(req, res) {
		var data = environment.getCoreUIData(req);
		res.render("timeview", data);
	});
};