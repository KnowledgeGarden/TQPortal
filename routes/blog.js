/**
 * Blog router
 */
exports.blog = function(req, res){
	var q = req.query;
	console.log('BLOGrout '+q);

  res.render('blog', { title: 'TQPortal' });
};