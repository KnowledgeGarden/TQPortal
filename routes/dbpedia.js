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
	app.get("/dbpedia", function(req,res) {
		var data = environment.getCoreUIData(req);
		res.render("dbpedia",data);
	});

};