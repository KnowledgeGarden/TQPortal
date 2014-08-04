/**
 * uploads app
 * invisible
 * @see https://github.com/domharrington/fileupload
 * @see https://github.com/expressjs/multer
 */
var img = require('easyimage')
  , multer = require('multer');

exports.plugin = function(app, environment, ppt, isPrivatePortal) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var imgs = ['png', 'jpg', 'jpeg', 'gif', 'bmp']; // only make thumbnail for these

	function getExtension(fn) {
	    return fn.split('.').pop();
	}
	function isPrivate(req,res,next) {
		if (isPrivatePortal) {
			if (req.isAuthenticated()) {return next();}
			res.redirect('/login');
		} else {
			{return next();}
		}
	}

	var baseURL = "/uploads/";
	var dirname = __dirname+"/../public/uploads/";
	console.log("Uploads dir: "+dirname);
	app.use(multer({
        dest: dirname,
        rename: function (fieldname, filename) {
            return filename.replace(/\W+/g, '-').toLowerCase();
        	}}));
	
	console.log("Uploads started");
	
	////////////////////
	// Routes
	///////////////////
	app.get('/upload/:id', isPrivate, function(req,res) {
		    var q = req.params.id;
		    console.log("UPLOAD "+q);
		    //not sure why,but it seems to work without implementing this
	});
	
	app.post('/upload', function(req, res) {
		var blob = req.files.files;
		topicMapEnvironment.logDebug(JSON.stringify(blob));
		console.log("AAA "+blob.name);
		//BUG: blob.path is the absolute file path name.
		// on chrome and safari, that yields a Not allowed to load local resource error
		//What we want is the object name + dirname;
		var result = baseURL+blob.name;
/**	    if (imgs.indexOf(getExtension(blob.name)) != -1) {
	     	console.log("BBB ");
	           img.info(blob.path, function (err, stdout, stderr) {
	     	console.log("CCC "+err);
	                if (err) throw err;
//	            console.log(stdout); // could determine if resize needed here
	                img.rescrop(
	                    {
	                        src: blob.path, dst: fnAppend(blob.path, 'thumb'),
	                        width: 50, height: 50
	                    },
	                    function (err, image) {
	                        if (err) throw err;
	                        res.statusCode = 200;
	                        res.send(blob.path);
	                      //  res.send({image: true, file: req.files.userFile.originalname, savedAs: req.files.userFile.name, thumb: fnAppend(req.files.userFile.name, 'thumb')});
	                    }
	                );
	            });
	       } else { */
		console.log("UPLOAD RETURNING "+result);
	    	   res.statusCode = 200;
               res.send(result);
	     //  }
//	            res.send({image: false, file: req.files.userFile.originalname, savedAs: req.files.userFile.name});	});
	});

};