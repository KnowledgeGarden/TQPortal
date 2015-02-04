/**
 * calendar
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/calendar","Calendar");

	app.get("/calendar", function calendarGet(req, res) {
		var data = environment.getCoreUIData(req);
		return res.render("calendar", data);
	});

};