process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

var io = require('socket.io').listen(8877),
	auth = require('./auth.js'),
	handleFiles = require("./handleFiles.js"),
	sockets=[];

io.set('transports', ['websocket']);

io.sockets.on('connection', function (socket) {
	socket.auth=false;
	sockets.push(socket);

	socket.on('initAuth',function (data){
		auth.initAuth(socket,data);
	});
	
	socket.on('startFile',function (data){
		handleFiles.startFile(socket,data);
	});

	socket.on('endFile',function (data){
		handleFiles.endFile(socket,data);
	});

	socket.on('logOut',function (){
		auth.logOut(socket);
	});

	socket.on('suggest',function (data){
		handleFiles.suggest(socket,data);
	});

	socket.on('updateSVN',function(){
		handleFiles.updatesvn(socket);
	});

	socket.on('changePass',function (data){
		auth.changePass(socket,data);
	});
});

function cleanSocketData(socketName){
	for(var file in files){
		if(files[file].user == socketName){
			delete files[file];
		}
	}
}

function populateMessage(socket,event,data){
	for(var i=0;i<sockets.length;i++){
		if(sockets[i].auth == false || sockets[i] == socket)
			continue;
		sockets[i].emit(event,data);
	}
}