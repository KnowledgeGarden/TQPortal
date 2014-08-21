/**
 * geomap
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/geomap","GeoMap");
    /////////////////
	// router
	/////////////////
	app.get("/geomap", function(req,res) {
		var data = environment.getCoreUIData(req);
		//NOTE, we can create a GeoMap model to control map initialization;
		// here we hard wire some values
		data.x = "30.0";
		data.y = "5.0";
		data.z = "2"; //zoom smaller is further out
		res.render("geomap",data);
	});

};