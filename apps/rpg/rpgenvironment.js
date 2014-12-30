/**
 * RolePlayingGameEnvironment
 */
var types = require('tqtopicmap/lib/types'),
    sb = require('tqtopicmap/lib/util/stringbuilder'),
    constants = require('../../core/constants'),
    Rbuf = require('../../core/util/ringbuffer'),
    RGBib = require('./rpginfoboxmodel')
;

var RPGEnvironment = module.exports = function(environment, tmenv) {
	var myEnvironment = environment,
	    TopicMapEnvironment = tmenv,
	    DataProvider = TopicMapEnvironment.getDataProvider(),
	    RPGInfoBoxModel = new RGBib(environment, tmenv),
	    issueRing = new Rbuf(20, "issue", TopicMapEnvironment),
	    questRing = new Rbuf(20, "quest", TopicMapEnvironment),
	    guildRing = new Rbuf(20, "guild", TopicMapEnvironment),
        self = this;

	//register for persisting recents
    //TODO: don't get to do this here because Environment is still building
	// environment.addRecentListener(this);
	console.log("RPGEnvironment started");
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