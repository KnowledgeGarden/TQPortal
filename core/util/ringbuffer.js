/**
 * RingBuffer -- not persistent
 * A RingBuffer gives us a temporary store which maintains
 * a list of documents for whatever purpose. The primary purpose
 * is imagined to be columns of "Recent <whatever>" on some
 * page, say, the landing page. Ideally, this will be driven by some
 * socket or long-polling mechanism to keep them alive.
 */
/**
 * @param size: typically 10 to 50 entries
 * @param name
 * @param environment: optional
 */
var RingBuffer = module.exports = function(size, name, environment) {
	var myenv = environment;
	var maxlen = size;
	var myname = name;
	var data = [];
	var self = this;
	
	/**
	 * Enough data to make a small HREF with icon in a view
	 * @param locator
	 * @param label
	 * @param smallicon
	 */
	self.add = function(locator,label,smallicon) {
//		if (data.length >= maxlen) {
//			data = data.splice(0,1);
//		}
//		if (myenv) {
//			myenv.logDebug("RingBuffer "+myname+" "+data);
//		}
		var s = {};
		s.locator = locator;
		s.label = label;
		s.smallicon = smallicon;
		//TODO: ideal to add this to the first rather than push it to the end
		//Otherwise, we must reverse the list going out
		data.push(s);
//		if (myenv) {
//			myenv.logDebug("RingBuffer "+myname+" "+data.length + " "+JSON.stringify(s));
//		}
	},
	
	self.getData = function() {
		return data;
	},
	
	self.getReversedData = function() {
//		if (myenv) {
//			myenv.logDebug("RingBuffer.getReversedData "+myname+" "+JSON.stringify(data));
//		}
		var result = [];
		var len = data.length;
		if (len > -1) {
//			if (myenv) {
//				myenv.logDebug("RingBuffer.getReversedData-1 "+myname+" "+len);
//			}
			for (var i=len;i>0;i--) {
//				if (myenv) {
//					myenv.logDebug("RingBuffer.getReversedData-2 "+data[i-1]);
//				}
				result.push(data[i-1]);
			}
		}
//		if (myenv) {
//			myenv.logDebug("RingBuffer.getReversedData+ "+myname+" "+JSON.stringify(result));
//		}
		return result;
	},
	
	self.size = function() {
		return data.length;
	};
};