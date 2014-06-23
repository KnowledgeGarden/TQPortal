/**
 * UUID
 */
var uuid = require('node-uuid');

exports.newUUID = function() {
	return uuid.v1();
};