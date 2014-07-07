/**
 * <p>Ticket; a server object for carrying user information around in sessions
 * We do not keep the <code>user</code> around for safety.</p>
 * <p>For guests, we create an empty Ticket with username = guest and no credentials.</p>
 * @param User can be <code>null</code>
 */
var properties = {
		'username' : '',
		'handle' : '',
		'image' : '',
		'avatar' : '',
		'email' : '',
		'homepage' : '',
		'credentials' : []
};
function Ticket(user) {
	if (user) {
		properties.username = user.getUserName();
		properties.handle= user.getHandle();
		properties.image = user.getImage();
		properties.avatar = user.getAvatar();
		properties.credentials = user.listCredentials;
	} 
}
Ticket.prototype.getUserName = function() {
	return properties.username;
};
Ticket.prototype.getHandle = function() {
	return properties.handle;
};
Ticket.prototype.getImage = function() {
	return properties.image;
};
Ticket.prototype.getAvatar = function() {
	return properties.avatar;
};
/**
 * @param credential: String
 * @returns  true || false
 */
Ticket.prototype.hasCredential = function(credential) {
	var cx = properties.credentials;
	var has = cx.indexOf(credential);
	return (has > -1);

};
Ticket.prototype.listCredentials = function() {
	return properties.credentials;
};
Ticket.prototype.setEmail = function(email) {
	properties.email = email;
};
Ticket.prototype.getEmail = function() {
	return properties.email;
};
Ticket.prototype.setHomepage = function(homepageURL) {
	properties.homepage = homepageURL;
};
Ticket.prototype.getHomepage = function() {
	return properties.homepage;
};


module.exports = Ticket;
