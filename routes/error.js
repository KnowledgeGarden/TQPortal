/**
 * error handler
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	

	app.get("/error/:id", function errorGet(req, res) {
		var q = req.params.id;
		var data = environment.getCoreUIData(req);
		data.errormessage = q;
		return res.render("500", data);
	});
};