function initAuth(socket,data){
	db.infotainment.findOne({nick:data.nick},function(err, user) {
		if(!err && !!user){
			if(user.pass === data.pass){
				socket.auth = true;
				socket.user = {name:user.name,nick:user.nick};
				socket.emit('succesAuth');
			}else{
				socket.auth = false;
				socket.user = null;
				socket.emit('errorAuth');
			}
		}
	});
}

function changePass(socket, data){
	if(socket.auth && !!socket.user.nick){
		db.infotainment.findOne({nick:socket.user.nick},function(err,user){
			if(!err && !!user){
				if(user.pass === data.oldP){
					db.infotainment.update({nick:socket.user.nick},{$set:{pass:data.newP}},function(err,data){
						if(!err){
							socket.emit("successChangePass");
						}else{
							socket.emit("errorChangePass",err);
						}
					});
				}else{
					socket.emit("invalidOldPass");
				}
			}else{
				socket.emit("errorChangePass",err);
			}
		});
	}else{
		socket.emit("errorChangePass","Socket no auth");
	}
}

function logOut(socket){
	socket.auth = false;
	socket.user = null;
}

exports.changePass = changePass;
exports.initAuth = initAuth;
exports.logOut = logOut;