/**
 * InfoBoxModel
 * This model should have the ability to read an InfoBox schema (JSON) and
 * paint an HTML form from it, then handle the InfoBox data.
 * A SubjectProxy has an infoBox API:
 *   putInfoBox = function(name, jsonString)
 *   removeInfoBox = function(name)
 *   getInfoBoxes = function()
 *   getInfoBox = function(name)
 * based on named boxes.
 */
var types = require('tqtopicmap/lib/types')
	, icons = require('tqtopicmap/lib/icons')
	, properties = require('tqtopicmap/lib/properties')
	, constants = require('../../core/constants')
;

var RPGInfoBoxModel = module.exports = function(environment, tmenv) {
	var NODE_VALUE_MATRIX = "NodeValueMatrix",
		USER_VALUE_MATRIX = "UserValueMatrix",
		GUILD_VALUE_MATRIX = "GuildValueMatrix";
	var myEnvironment = environment,
        topicMapEnvironment =tmenv,
        DataProvider = topicMapEnvironment.getDataProvider(),
        self = this;
	
	//////////////////////////////////////
	//General getters and setters on a given node
	// Caller required to persist any changes
	// Caller's option on what content is set inside each valuematrix
	//////////////////////////////////////
	/**
	 * @param node
	 * @return can return undefined
	 */
	self.getNodeValueMatrix = function(node) {
		return node.getInfoBox(NODE_VALUE_MATRIX);
	},
	
	self.putNodeValueMatrix = function(node, json) {
		node.putInfoBox(NODE_VALUE_MATRIX, json);
	},
	
	/**
	 * @param node
	 * @return can return undefined
	 */
	self.getUserValueMatrix = function(node) {
		return node.getInfoBox(USER_VALUE_MATRIX);
	},
	
	self.putUserValueMatrix = function(node, json) {
		node.putInfoBox(USER_VALUE_MATRIX, json);
	},
	
	/**
	 * @param node
	 * @return can return undefined
	 */
	self.getGuildValueMatrix = function(node) {
		return node.getInfoBox(GUILD_VALUE_MATRIX);
	},
	
	self.putGuildValueMatrix = function(node, json) {
		node.putInfoBox(GUILD_VALUE_MATRIX, json);
	};
};
