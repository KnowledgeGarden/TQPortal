/**
 * HomeModel: 
 * This one paints recent stuff.
 */
var types = require('tqtopicmap/lib/types')
, icons = require('tqtopicmap/lib/icons')
, properties = require('tqtopicmap/lib/properties')

  , constants = require('../../core/constants')
  , uuid = require('../../core/util/uuidutil')
  , tagmodel = require('../tag/tagmodel');

var HomeModel =  module.exports = function(environment) {
console.log("Starting HomeModel");
	var self = this;
	
	self.listRecentTags = function() {
		return environment.listRecentTags();
	},
	self.listRecentBlogs = function() {
		return environment.listRecentBlogs();
	},
	self.listRecentWikis = function() {
		return environment.listRecentWikis();
	},
	self.listRecentConversations = function() {
		return environment.listRecentConversations();
	},
	self.listRecentBookmarks = function() {
		return environment.listRecentBookmarks();
	}

};