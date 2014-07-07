/**
 * Wiki model
 */
/*var mongoose = require('mongoose')
  , Topic = require('./topic') //mongoose.model('Topic')
  , tm = require('./tags')
  , types = require('../types')
  , icons = require('../icons')
  , uuid = require('../util/uuidutil')
  , utils = require('../util/utils');
*/
var WikiModel =  module.exports = function(environment) {
	var topicMapEnvironment = environment.getTopicMapEnvironment();
	var Dataprovider = topicMapEnvironment.getDataProvider();
/*  this.TagModel = new tm();
  this.types = types;
  this.icons = icons;
  var self = this;
	  
  /**
   * Create a new wiki topic
   * @param wiki: a JSON object filled in
   * @user: a User object to be converted to a userTopic
   * /
  self.create = function (wiki, user, callback) {
    //TODO		
  };
*/	
};