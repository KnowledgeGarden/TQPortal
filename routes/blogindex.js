/**
 * BlogIndexRouter
 */
exports.blogindex = function(req, res){
	//TODO alternate layout
  res.render('blogindex', { title: 'Blogs' });
};