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
  , uuid = require('../util/uuidutil')
  , utils = require('../util/utils');

var BlogModel =  module.exports = function() {
  this.TagModel = new tm();
  this.types = types;
  this.icons = icons;
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
                  article.addRelation(self.types.TAG_DOCUMENT_RELATION_TYPE, 'Tag-Document Relation', self.icons.TAG_SM, lox[i],labs[i]);
                }
    		  }
              console.log("ARTICLES_CREATE_2 "+JSON.stringify(article));
              article.addRelation(self.types.DOCUMENT_CREATOR_RELATION_TYPE, 'Document-Creator Relation',self.icons.PERSON_ICON_SM, user.handle,user.handle);
              article.save(function(err) {
                console.log('ARTICLES_CREATE-3 '+err);	  
                if (!err) {
                  console.log('ARTICLES_CREATE-3a '+thisUser);	  
            	  
                  thisUser.addRelation(self.types.DOCUMENT_CREATOR_RELATION_TYPE, 'Document-Creator Relation', self.icons.PUBLICATION_SM, article.locator, article.label);
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
              article.addRelation(self.types.TAG_DOCUMENT_RELATION_TYPE, 'Tag-Document Relation', self.icons.TAG_SM, lox[i],labs[i]);
            }
		  }
          console.log("ARTICLES_CREATE_22 "+JSON.stringify(article));
          article.addRelation(self.types.DOCUMENT_CREATOR_RELATION_TYPE, 'Document-Creator Relation', self.icons.PERSON_ICON_SM, user.handle,user.handle);
          article.save(function(err) {
            console.log('ARTICLES_CREATE-33 '+err);	  
            if (!err) {
              console.log('ARTICLES_CREATE-33a '+thisUser);	  
        	  
              thisUser.addRelation(self.types.DOCUMENT_CREATOR_RELATION_TYPE, 'Document-Creator Relation',self.icons.PUBLICATION_SM, article.locator,"Blog Post");
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


