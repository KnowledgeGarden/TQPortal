/**
 
 * GET admin page
 
 */

//var url = require('url');

exports.admin = function(req, res){
   
	//var parsed_url = url.parse(req.url, true);

  	//console.log(parsed_url);

	res.render('admin', { title: 'Admin' });

};