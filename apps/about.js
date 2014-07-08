/**
 * about app
 */
exports.plugin = function(app, environment, ppt) {

	  /////////////////
	  // Routes
	  /////////////////
	  app.get('/about', function(req,res) {
	    res.render('about');
	  });

}