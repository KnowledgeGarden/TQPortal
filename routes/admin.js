/**
 
 * GET admin page
 
 */

exports.admin = function(req, res){
   
	res.render('admin', { title: 'Admin' });

};

exports.exportdb = function(req, res){
	res.render('exportdb', { title: 'Admin' });

};

exports.importdb = function(req, res){
	res.render('importdb', { title: 'Admin' });

};

exports.inviteuser = function(req, res){
	res.render('inviteuser', { title: 'Admin' });

};

exports.listusers = function(req, res){
	res.render('listusers', { title: 'Admin' });

};