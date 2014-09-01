/**
 * wsserver -- websockets
 * http://einaros.github.io/ws/
 */
var wss = require("nodejs-websocket");
var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};
var server = wss.createServer(function (connection) {
	connection.nickname = null;
	
	//This seems to ring
	connection.on("text", function (str) {
		console.log("TEXT "+str);
		//block nickname only -- empty message
		if (!endsWith(str, ':')) {
			if (connection.nickname === null) {
					connection.nickname = str;
					console.log("WSSFOO");
						broadcast(str);
					
			} else {
				broadcast("["+connection.nickname+"] "+str);
			}
		}
	});
	function broadcast(str) {
		console.log("BROADCAST "+str);
		server.connections.forEach(function (connection) {
			connection.sendText(str);
		});
	}
	connection.on("close", function () {
		broadcast(connection.nickname+" left");
	});
	connection.on("error", function(err) {
		console.log("WSS error "+err);
	});
});
server.listen(4444);


/**
wss = new WSServer({port:4444});
console.log("WebSocketServer "+wss);
var clients = [];
wss.on('connection', function(socket) {
	console.log("WSS "+clients);
	
	if (clients.indexOf(socket) < 0) {
		clients.push(socket);
	}
	console.log("WSS foo");
	var length=0;
	socket.on('message', function (msg) {
		length = clients.length;
		//console.log('Recieved: ', msg, '\n',
		//'From IP: ', socket.upgradeReq.connection.remoteAddress);
		//socket.send(msg); 
		console.log("WSS msg "+length+" "+msg)
		var broadcast = function(msg) {
		    for(var i=0;i<length;i++) {
		    	console.log(clients[i]);
		        clients[i].send(msg);
		    }
		}
		if (msg != "") {
			broadcast(msg);
		}
	});
});
*/