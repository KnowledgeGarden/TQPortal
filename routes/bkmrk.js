/*
 * GET bookmarklet page.
 * a bookmarklet looks like:
 * javascript:location.href='http://<serverurl>/bkmrk?url='+
            
 *   encodeURIComponent(location.href)+'&title='+
            
 *   encodeURIComponent(document.title)
 */
var bkmrk = require('../apps/models/bookmarkmodel'); // /index
var bookmark = bkmrk;

exports.bkmrk = function(req, res){
	var q = req.query;
	var url = q.url;
	var title = q.title;
	var credentials = [];
console.log('Routes/bkmrk '+url+' | '+title);
	bookmark.getBookmarklet(url,title, credentials, function(err,data) {
		console.log('routes.bkmark got '+err+' | '+data);
		if (data) {
		var len = data.length;
		for (var i=0;i<len;i++)
			console.log(data[i].toJSON());
		}

	});
	//TODO this must be inside the callback
	// If the bookmark exists, paint it for further tagging,
	// otherwise paint an empty bookmarklet view with title and url
  res.render('bkmrk', { title: 'Bookmarklet' });
};