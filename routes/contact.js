/**
 * contact app
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {

	/////////////////
	// Routes
	/////////////////
	app.get('/contact', function contactGet(req, res) {
		return res.render('contact', environment.getCoreUIData(req));
	});

};