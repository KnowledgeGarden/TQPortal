
/*
 * GET home page.
 */

exports.index = function(req, res){
	//changing this value allows changing landing page
  var idx = 'newindex';
  res.render(idx, { title: 'TQPortal' });
};