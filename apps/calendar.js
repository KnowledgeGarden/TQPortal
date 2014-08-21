/**
 * calendar
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/calendar","Calendar");

	app.get("/calendar", function(req,res) {
		var data = environment.getCoreUIData(req);
		res.render("calendar",data);
	});

};