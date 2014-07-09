/**
 * about app
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {

  /////////////////
  // Routes
  /////////////////
  app.get('/about', function(req,res) {
    res.render('about');
  });
};