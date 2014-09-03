/**
 * RolePlayingGameEnvironment
 */
var  types = require('../../node_modules/tqtopicmap/lib/types')
	, sb = require('../../node_modules/tqtopicmap/lib/util/stringbuilder')
	, constants = require('../../core/constants')
	, rbuf = require('../../core/util/ringbuffer')
	, ib = require('./rpginfoboxmodel')
;

var RPGEnvironment = module.exports = function(environment, tmenv) {
	var myEnvironment = environment;
	var TopicMapEnvironment = tmenv;
	var DataProvider = TopicMapEnvironment.getDataProvider();
	var RPGInfoBoxModel = new ib(environment);
	var issueRing = new rbuf(20, "issue", TopicMapEnvironment);
	var questRing = new rbuf(20, "quest", TopicMapEnvironment);
	var guildRing = new rbuf(20, "guild", TopicMapEnvironment);

	//register for persisting recents
	environment.addRecentListener(this);
	console.log("RPGEnvironment started");
	var self = this;
	//TODO
	
	self.getInfoBoxModel = function() {
		return RPGInfoBoxModel;
	},
	
	self.persistRecents = function() {
		console.log("RPGEnvironment.persistRecents");
	},
	
	self.addRecentIssue = function(locator,label) {
		var d = new Date().getTime();
		var d = new Date().getTime();
		issueRing.add(locator,label,d);
	},
	self.addRecentGuild = function(locator,label) {
		var d = new Date().getTime();
		var d = new Date().getTime();
		guildRing.add(locator,label,d);
	},
	self.addRecentQuest = function(locator,label) {
		var d = new Date().getTime();
		var d = new Date().getTime();
		questRing.add(locator,label,d);
	}

};