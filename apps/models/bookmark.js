/**
 * Bookmark model
 */
var mongoose = require('mongoose')
  , Topic = require('./topic') //mongoose.model('Topic')
  , tm = require('./tags')
  , types = require('../types')
  , icons = require('../icons')
  , uuid = require('../util/uuidutil')
  , utils = require('../util/utils');

var BookmarkModel =  module.exports = function() {
  this.TagModel = new tm();
  this.types = types;
  this.icons = icons;
  var self = this;
  
  /**
   * Create a new bookmark
   * @param bookmark: a JSON object filled in
   * @user: a User object to be converted to a userTopic
   */
  self.create = function (bookmark, user, callback) {
    //TODO		
  };
};