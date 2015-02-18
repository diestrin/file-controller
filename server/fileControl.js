/*process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});*/

console.log('Initializacion...');

var https = require("https"),
	fs = require("fs");

console.log('Reading keys...');

var hskey = fs.readFileSync("./ssl/privateKey.key"),
	hscert = fs.readFileSync("./ssl/certificate.crt"),
	options = {
		key: hskey,
		cert: hscert
	};

console.log('Reading keys ok');
console.log('Creating server...');

var app = https.createServer(options, handler).listen(8877),
	io = require('socket.io').listen(app),
	auth = require('./app_modules/auth.js'),
	handleFiles = require("./app_modules/handleFiles.js"),
	sockets=[];

console.log('Creating server ok at port 8877');

io.set('transports', ['websocket']);

console.log('Initializacion ok');
console.log('Watting for connections..');

io.sockets.on('connection', function (socket) {
	console.log('Socket connected');
	socket.auth = false;
	//sockets.push(socket);

	socket.on('initAuth',function (data , callback){
		auth.initAuth(socket , data , callback);
	});
	
	socket.on('startFile',function (data , callback){
		handleFiles.startFile(socket , data , callback);
	});

	socket.on('endFile',function (data , callback){
		handleFiles.endFile(socket , data , callback);
	});

	socket.on('logOut',function (){
		auth.logOut(socket);
	});

	socket.on('suggest',function (data , callback){
		handleFiles.suggest(socket , data , callback);
	});

	socket.on('updateSVN',function (data , callback){
		handleFiles.updatesvn(socket , callback);
	});

	socket.on('changePass',function (data , callback){
		auth.changePass(socket , data , callback);
	});
});

function populateMessage(socket,event,data){
	for(var i=0;i<sockets.length;i++){
		if(sockets[i].auth == false || sockets[i] == socket)
			continue;
		sockets[i].emit(event,data);
	}
}

function handler (req , res) {
	res.end("Hi frome ssh");
}