/**
 * contact app
 */
exports.plugin = function(app, environment, ppt) {

	  /////////////////
	  // Routes
	  /////////////////
	  app.get('/contact', function(req,res) {
	    res.render('contact');
	  });

}