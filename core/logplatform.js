/**
 * logplatform
 * Setup all the system logs
 */
var log4js = require('log4js')
	,fs = require('fs')
;
/**
 * @param callback signature (logplatform)
 */
function LogPlatform(callback) {
	var logger;
	var monitor;
	var api;
	var path1 = __dirname+"/../config/logger.json";
	log4js.configure(path1);
    logger = log4js.getLogger("Portal");
    logger.setLevel('ERROR');
    var x = logger.setLevel('debug');

    monitor = log4js.getLogger("Monitor");
    monitor.setLevel('ERROR');
    x = monitor.setLevel('debug');

    api = log4js.getLogger("API");
    api.setLevel('ERROR');
    x = api.setLevel('debug');
    
    this.logger = logger;
    this.monitor = monitor;
    this.api = api;
    console.log("LogPlatform "+this);
    callback(this);
}

LogPlatform.prototype.getLogger = function() {
	return this.logger;
};

LogPlatform.prototype.getMonitorLogger = function() {
	return this.monitor;
};

LogPlatform.prototype.getAPILogger = function() {
	return this.api;
};

module.exports = LogPlatform;