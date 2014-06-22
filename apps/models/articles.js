/**
 * Blog Model
 * <p>A blog post is an instance of a Topic.
 * Each tag is an instance of a Topic.
 * Each comment is an instance of a Topic.
 * All tags and comments are represented as
 * <em>relations</em> with the blog's Topic
 * </p>
 */
var mongoose = require('mongoose')
  , Topic = require('./topic') //mongoose.model('Topic')
  , tm = require('./tags')
  , types = require('../types')
  , icons = require('../icons')
  , uuid = require('../../lib/uuidutil')
  , utils = require('../../lib/utils');

var BlogModel =  module.exports = function() {
  this.TagModel = new tm();
  this.types = types;
  console.log("TAGMODEL "+this.TagModel);
  var self = this;
  /**
   * Create a new blog post
   * @param blog: a JSON object with appropriate values set
   * @param user
   * @param callback: signature (err, result): result = _id of new object
   */
  self.create = function (blog, user, callback) {
    console.log('ARTICLES_CREATE '+JSON.stringify(blog));
    var article = new Topic();
    article.locator = uuid.newUUID();
    article.instanceOf = self.types.BLOG_TYPE;
    article.creatorId = user._id;
    article.largeIcon = icons.PUBLICATION;
    article.smallIcon = icons.PUBLICATION_SM;
    //we have to take this apart, build the object from scratch
    // because of tags, which are relations.
    var label = blog.title;
    article.label = label;
    var details = blog.body;
    article.details = details;
    // fetch the user for later linking
    console.log('ARTICLES_CREATE-00 '+JSON.stringify(user));
    Topic.findNodeByLocator(user.username, function(err,result) {
      var thisUser = result;
      console.log('ARTICLES_CREATE-0 '+thisUser);
      var tags = blog.tags;
      console.log('ARTICLES_CREATE-1 '+article);
      console.log("ARTICLES_CREATE_1a "+self.TagModel);
      if (tags.indexOf(',') > -1) {
    	  var tagList = tags.split(',');
    	  self.TagModel.processTagList(tagList, thisUser, article.locator,label, function(err,result) {
              console.log('NEW_POST-1 '+JSON.stringify(result));
              var lox = result.locators;
    		  var labs = result.labels;
    		  //see to it that we have some tags
    		  if (lox) {
                var len = lox.length;
                for (var i=0;i<len;i++) {
                  article.addRelation(self.types.SIMPLE_RELATION_TYPE, self.types.TAG_DOCUMENT_RELATION_TYPE, 'Tag-Document Relation', lox[i],labs[i]);
                }
    		  }
              console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
              article.addRelation(self.types.SIMPLE_RELATION_TYPE, self.types.DOCUMENT_CREATOR_RELATION_TYPE, 'Document-Creator Relation', user.handle,user.handle);
              article.save(function(err) {
                console.log('ARTICLES_CREATE-3 '+err);	  
                if (!err) {
                  console.log('ARTICLES_CREATE-3a '+thisUser);	  
            	  
                  thisUser.addRelation(self.types.SIMPLE_RELATION_TYPE, self.types.DOCUMENT_CREATOR_RELATION_TYPE, 'Document-Creator Relation', article.locator,"Blog Post");
                  thisUser.save(function(err) {
                    console.log('ARTICLES_CREATE-4 '+err);	  
                    if (!err) {
                    callback(err,article._id);
                    } else {
                      callback(err,null);
                    }
                  }); //thisUser.save
                } else {
                  callback(err,null);
                }
              }); //article.save   		  
    	  });
      } else {
      
        self.TagModel.processTag(tags, thisUser, article.locator, label, function(err,result) {
          console.log('NEW_POST-2 '+JSON.stringify(result));
          //result is a structure:
          //{ locators: [],labels: [] }
          //which allows us to store the locators for each tag and the labels.
          //IN FACT: the TopicSchema is not setup to handle this structure,
          // but interestingly, could accept it anyway.
          //PERHAPS that's a better way to pass relations: a locator and some kind of label
          // with which to make an HREF at the browser
          var lox = result.locators;
		  var labs = result.labels;
		  //see to it that we have some tags
		  if (lox) {
            var len = lox.length;
            for (var i=0;i<len;i++) {
              article.addRelation(self.types.SIMPLE_RELATION_TYPE, self.types.TAG_DOCUMENT_RELATION_TYPE, 'Tag-Document Relation', lox[i],labs[i]);
            }
		  }
          console.log("ARTICLES_CREATE_22 "+JSON.stringify(article));
          article.addRelation(self.types.SIMPLE_RELATION_TYPE, self.types.DOCUMENT_CREATOR_RELATION_TYPE, 'Document-Creator Relation', user.handle,user.handle);
          article.save(function(err) {
            console.log('ARTICLES_CREATE-33 '+err);	  
            if (!err) {
              console.log('ARTICLES_CREATE-33a '+thisUser);	  
        	  
              thisUser.addRelation(self.types.SIMPLE_RELATION_TYPE, self.types.DOCUMENT_CREATOR_RELATION_TYPE, 'Document-Creator Relation', article.locator,"Blog Post");
              thisUser.save(function(err) {
                console.log('ARTICLES_CREATE-44 '+err);	  
                if (!err) {
                callback(err,article._id);
                } else {
                  callback(err,null);
                }
              }); //thisUser.save
            } else {
              callback(err,null);
            }
          }); //article.save
        });//processTags
      }
    });
  };
};

/**
 * Validations
 * /

TopicSchema.path('label').required(true, 'Article title cannot be blank');
TopicSchema.path('details').required(true, 'Article body cannot be blank');


/**
 * Methods
 * /

ArticleSchema.methods = {

  /**
   * Save article and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   * /

  uploadAndSave: function (images, cb) {
    if (!images || !images.length) return this.save(cb)

    var imager = new Imager(imagerConfig, 'S3')
    var self = this

    this.validate(function (err) {
      if (err) return cb(err);
      imager.upload(images, function (err, cdnUri, files) {
        if (err) return cb(err)
        if (files.length) {
          self.image = { cdnUri : cdnUri, files : files }
        }
        self.save(cb)
      }, 'article')
    })
  },
  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @param {Function} cb
   * @api private
   * /

  addComment: function (user, comment, cb) {
    var notify = require('../mailer')

    this.comments.push({
      body: comment.body,
      user: user._id
    });

//    if (!this.user.email) this.user.email = 'email@product.com'
//    notify.comment({
//      article: this,
//      currentUser: user,
 //     comment: comment.body
//    })

    this.save(cb);
  },

  /**
   * Remove comment
   *
   * @param {commentId} String
   * @param {Function} cb
   * @api private
   * /

  removeComment: function (commentId, cb) {
    var index = utils.indexof(this.comments, { id: commentId });
    if (~index) this.comments.splice(index, 1);
    else return cb('not found');
    this.save(cb);
  }
};

/**
 * Statics
 * /

ArticleSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   * /

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec(cb);
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   * /

  list: function (options, cb) {
    var criteria = options.criteria || {};

    this.find(criteria)
      .populate('user', 'name username')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }

};

/////////////////////////////
// Articles
/////////////////////////////
/**
 * Load
 * /

exports.load = function(req, res, next, id){
  var User = mongoose.model('User')

  Article.load(id, function (err, article) {
    if (err) return next(err);
    if (!article) return next(new Error('not found'));
    req.article = article;
    next();
  });
};

/**
 * List
 * /

exports.index = function(req, res) {
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 30;
  var options = {
    perPage: perPage,
    page: page
  };

  Article.list(options, function(err, articles) {
    if (err) return res.render('500');
    Article.count().exec(function (err, count) {
      res.render('articles/index', {
        title: 'Articles',
        articles: articles,
        page: page + 1,
        pages: Math.ceil(count / perPage)
     });
    });
  });
};

mongoose.model('Article', ArticleSchema);

var Article = mongoose.model('Article');

/**
 * New article
 * /

exports.newarticle = function(req, res) {
	console.log('ARTICLE.NEW');
    res.render('blogform', {
    title: 'New Article',
    article: new Article({})
  });
};

/**
 * Create an article
 * @param req
 * @param res
 * /
exports.create = function (req, res) {
	console.log('ARTICLES_CREATE '+req.body.title);
  var article = new Article(req.body);
  article.user = req.user;
  console.log('NEW_POST '+article);
  article.save(function(err) {
	console.log('ARTICLES_CREATE-1 '+err);
	  
    if (!err) {
      req.flash('success', 'Successfully created article!');
      return res.redirect('/blog/'+article._id);
    }
  });
  //see if there is an image to upload
/*  if (req.files.image) {
	  article.uploadAndSave(req.files.image, function (err) {
	    if (!err) {
	      req.flash('success', 'Successfully created article!');
	      return res.redirect('/blog/'+article._id);
	    }
	
	    res.render('blog/new', {
	      title: 'New Article',
	      article: article,
	      error: utils.errors(err.errors || err)
	    });
	  });
  } * /
};

/**
 * Edit an article
 * /

exports.edit = function (req, res) {
  res.render('blog/edit', {
    title: 'Edit ' + req.article.title,
    article: req.article
  });
};

/**
 * Update article
 * /

exports.update = function(req, res){
  var article = req.article;
  article = extend(article, req.body);

  article.uploadAndSave(req.files.image, function(err) {
    if (!err) {
      return res.redirect('/blog/' + article._id);
    }

    res.render('blog/edit', {
      title: 'Edit Article',
      article: article,
      error: utils.errors(err.errors || err)
    });
  });
};

/**
 * Show
 * /

exports.show = function(req, res){
	console.log('ARTICLES.show-1 '+req.params.id);
	//fetch the given article by its _id passed in from the request,
	// e.g. /blog/5343429ax934
	var id = req.params.id;
	var q = {};
	q['_id'] = id;
	Article.findOne(q,function(err,result) {
		//if you find it, show it
		console.log('ARTICLES.show-2 '+err);
		if (result) {
			console.log('ARTICLES.show-3 '+JSON.stringify(result));
		//  res.render('blog/show', {
//		    title: req.article.title,
//		    article: req.article
		//  });
		} else {
			//TOO BAD: post identified by id not found
		}

	});
	
};

/**
 * Delete an article
 * /

exports.destroy = function(req, res){
  var article = req.article;
  article.remove(function(err) {
    req.flash('info', 'Deleted successfully');
    res.redirect('/blog');
  });
};

*/
///////////////////////////
// Comments
///////////////////////////


/////////////////////////////
// Tags
/////////////////////////////
