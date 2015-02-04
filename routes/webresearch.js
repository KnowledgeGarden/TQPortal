/**
 * New node file
 */

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var myEnvironment = environment;
	
	/////////////////
	// Menu
	/////////////////
	myEnvironment.addApplicationToMenu("/research","Research");
	/////////////////
	// Routes
	/////////////////
	app.get('/research', function webResearchGet(req, res) { 
		
		res.render('webresearch', myEnvironment.getCoreUIData(req));
	});
}