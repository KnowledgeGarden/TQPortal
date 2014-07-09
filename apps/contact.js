/**
 * contact app
 */
exports.plugin = function(app, environment, ppt, isPrivatePortal) {

  /////////////////
  // Routes
  /////////////////
  app.get('/contact', function(req,res) {
    res.render('contact');
  });

};