/**
 * blog model
 */
var mongoose = require('mongoose')
  , bcrypt   = require('bcryptjs')
  , Schema = mongoose.Schema;

/**
 * Getters
 */

var getTags = function (tags) {
  return tags.join(',')
};

/**
 * Setters
 */

var setTags = function (tags) {
  return tags.split(',')
};
////////////////////////////
// Primary Schema
////////////////////////////
var ArticleSchema = new Schema ({
	  title     : {type : String, default : '', trim : true}, 
	  body     : {type : String, default : '', trim : true},
	  tags: {type: [], get: getTags, set: setTags},
	  user: { type : Schema.ObjectId, ref : 'User' },
	  createdAt  : {type : Date, default : Date.now}
	});
/**
 * Validations
 */

ArticleSchema.path('title').required(true, 'Article title cannot be blank');
ArticleSchema.path('body').required(true, 'Article body cannot be blank');

/**
 * Pre-remove hook
 */

ArticleSchema.pre('remove', function (next) {
  var imager = new Imager(imagerConfig, 'S3')
  var files = this.image.files

  // if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err)
  }, 'article')

  next()
})

/**
 * Methods
 */

ArticleSchema.methods = {

  /**
   * Save article and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */

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
   */

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
   */

  removeComment: function (commentId, cb) {
    var index = utils.indexof(this.comments, { id: commentId });
    if (~index) this.comments.splice(index, 1);
    else return cb('not found');
    this.save(cb);
  }
}

/**
 * Statics
 */

ArticleSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

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
   */

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

mongoose.model('Article', ArticleSchema)
/////////////////////////////
// Articles
/////////////////////////////
/**
 * Load
 */

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
 */

exports.index = function(req, res){
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

/**
 * New article
 */

exports.new = function(req, res) {
	console.log('ARTICLE.NEW');
  res.render('blogform', {
    title: 'New Article',
    article: new Article({})
  });
};

/**
 * Create an article
 */

exports.create = function (req, res) {
  var article = new Article(req.body);
  article.user = req.user;

  article.uploadAndSave(req.files.image, function (err) {
    if (!err) {
      req.flash('success', 'Successfully created article!');
      return res.redirect('/articles/'+article._id);
    }

    res.render('articles/new', {
      title: 'New Article',
      article: article,
      error: utils.errors(err.errors || err)
    });
  });
};

/**
 * Edit an article
 */

exports.edit = function (req, res) {
  res.render('articles/edit', {
    title: 'Edit ' + req.article.title,
    article: req.article
  });
};

/**
 * Update article
 */

exports.update = function(req, res){
  var article = req.article;
  article = extend(article, req.body);

  article.uploadAndSave(req.files.image, function(err) {
    if (!err) {
      return res.redirect('/articles/' + article._id);
    }

    res.render('articles/edit', {
      title: 'Edit Article',
      article: article,
      error: utils.errors(err.errors || err)
    });
  });
};

/**
 * Show
 */

exports.show = function(req, res){
  res.render('articles/show', {
    title: req.article.title,
    article: req.article
  });
};

/**
 * Delete an article
 */

exports.destroy = function(req, res){
  var article = req.article;
  article.remove(function(err) {
    req.flash('info', 'Deleted successfully');
    res.redirect('/articles');
  });
};
///////////////////////////
// Comments
///////////////////////////
/**
 * Load comment
 */

exports.load = function (req, res, next, id) {
  var article = req.article;
  utils.findByParam(article.comments, { id: id }, function (err, comment) {
    if (err) return next(err);
    req.comment = comment;
    next();
  });
};

/**
 * Create comment
 */

exports.create = function (req, res) {
  var article = req.article;
  var user = req.user;

  if (!req.body.body) return res.redirect('/articles/'+ article.id);

  article.addComment(user, req.body, function (err) {
    if (err) return res.render('500');
    res.redirect('/articles/'+ article.id);
  });
};

/**
 * Delete comment
 */

exports.destroy = function (req, res) {
  var article = req.article;
  article.removeComment(req.param('commentId'), function (err) {
    if (err) {
      req.flash('error', 'Oops! The comment was not found');
    } else {
      req.flash('info', 'Removed comment');
    }
    res.redirect('/articles/' + article.id);
  });
};

/////////////////////////////
// Tags
/////////////////////////////
/**
 * List items tagged with a tag
 */

exports.index = function (req, res) {
  var criteria = { tags: req.param('tag') };
  var perPage = 5;
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var options = {
    perPage: perPage,
    page: page,
    criteria: criteria
  };

  Article.list(options, function(err, articles) {
    if (err) return res.render('500');
    Article.count(criteria).exec(function (err, count) {
      res.render('articles/index', {
        title: 'Articles tagged ' + req.param('tag'),
        articles: articles,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};