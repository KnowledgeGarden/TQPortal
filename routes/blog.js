/**
 * Blog router
 */
exports.blog = function(req, res){
	//TODO alternate layout
  res.render('blog', { title: 'TQPortal' });
};