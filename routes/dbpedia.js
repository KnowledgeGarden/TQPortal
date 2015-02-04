/**
 * dbpedia
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	/////////////////
	// Menu
	/////////////////
	environment.addApplicationToMenu("/dbpedia","DbPedia");
    /////////////////
	// router
	/////////////////
	app.get("/dbpedia", function dbPediaGet(req, res) {
		var data = environment.getCoreUIData(req);
		return res.render("dbpedia", data);
	});

};