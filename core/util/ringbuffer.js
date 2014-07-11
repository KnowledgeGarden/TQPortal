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
 */
var RingBuffer = module.exports = function(size) {
	var maxlen = size;
	var data = [];
	var self = this;
	
	/**
	 * Enough data to make a small HREF with icon in a view
	 * @param locator
	 * @param label
	 * @param smallicon
	 */
	self.add = function(locator,label,smallicon) {
		if (data.length >= maxlen) {
			data = data.splice(0,1);
		}
		var s = {};
		s.locator = locator;
		s.label = label;
		s.smallicon = smallicon;
		data.push(s);
	},
	
	self.getData = function() {
		return data;
	};
};