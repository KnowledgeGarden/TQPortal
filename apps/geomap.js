/**
 * geomap
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/geomap","GeoMap");

	app.get("/geomap", function(req,res) {
		var data = environment.getCoreUIData(req);
		res.render("geomap",data);
	});

}