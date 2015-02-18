var db = require("./db.js");

function initAuth(socket , data , callback){
	db.selectUser(data.nick , function(err, user) {
		if(!err)
			if(!!user){
				if(user.pass === data.pass){
					socket.auth = true;
					socket.user = {name:user.name,nick:user.nick};
					callback('succesAuth',user.files);
				}else{
					socket.auth = false;
					socket.user = null;
					callback('errorAuth');
				}
			}else{
				callback('noUser',data.nick);
			}
		else
			callback('error',err);
	});
}

function changePass(socket, data , callback){
	if(socket.auth && !!socket.user.nick){
		db.selectUser(socket.user.nick , function(err,user){
			if(!err && !!user){
				if(user.pass === data.oldP){
					db.changeUserPass(socket.user.nick , data.newP , function(err , newPass){
						if(!err && !!newPass){
							callback("successChangePass");
						}else{
							callback("errorChangePass",err);
						}
					});
				}else{
					callback("invalidOldPass");
				}
			}else{
				callback("errorChangePass",err);
			}
		});
	}else{
		callback("errorChangePass","Socket no auth");
	}
}

function logOut(socket){
	socket.auth = false;
	socket.user = null;
}

exports.changePass = changePass;
exports.initAuth = initAuth;
exports.logOut = logOut;