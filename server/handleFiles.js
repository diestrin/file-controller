var fs = require("fs"),
	exec = require('child_process').exec,
	svnPath = "../svn/infotainment";

var dirMap = retriveFolders(fs.readdirSync(svnPath));

function startFile(socket,data){
	if(socket.auth)
		try{
			db.infotainment.findOne({
				name:"fileList",
				files:{
					fileName:data.fileName,
					user:socket.user.name
				}
			},function(err, file) {
				if(!err){
					if(!!file){
						if(socket.user.name == file.user)
							socket.emit('inUseByYou');
						else	
							socket.emit('fileInUse',file);
					}else{
						db.infotainment.update(
						{
							name:"fileList"
						},{
							$push:{
								files:{
									fileName : data.fileName,
									user : socket.user.name
								}
							}
						});
						populateMessage(socket,'startFile',{fileName:data.fileName,user:socket.user.name});
					}
				}
			});
		}catch (e){
			console.log(e);
		}
	else
		socket.emit('noAuth');
}

function endFile(socket,data){
	if(socket.auth)
		try{
			db.infotainment.findOne({
				name:"fileList",
				files:{
					fileName:data.fileName,
					user:socket.user.name
				}
			},function(err, file) {
				if(!err){
					if(!!file){
						db.infotainment.update({
							name:"fileList"
						},{
							$pull:{
								files:{
									fileName:data.fileName,
									user:socket.user.name
								}
							}
						},function(err,data){

						});
						populateMessage(socket,'endFile',{fileName:data.fileName,user:socket.user.name});
						socket.emit('succesEnd',data.fileName);

					}else{
						socket.emit('cantEnd',{fileName:data.fileName,user:file.user});
					}
				}
			});
		}catch (e){
			console.log(e);
		}
	else
		socket.emit('noAuth');
}

function suggest(socket,data){
	var maxResults = 5,
		actualResults = []
		iterator = 0;

	data.pattern = data.pattern.replace(/(\;|\'|\:|\"|\{|\}|\[|\]|\(|\)|\,)/gi,'');
	var reg = new RegExp(data.pattern,"gi");

	db.infotainment.findOne({name:"fileList"},function(err,_files){
		var files = _files.files;
		for(var item in dirMap)
			if(iterator <= maxResults){
				if(dirMap[item].match(reg)){
					var vacant = {state: false};
					for(var file in files){
						if(files[file].fileName == dirMap[item]){
							var user = files[file].user == socket.user.name ? "You" : files[file].user;
							vacant = {
								state: true, 
								user: user
							}
							break;
						}	
					}
					actualResults.push({file:dirMap[item],vacant:vacant});
					iterator++;
				}
			}else{
				socket.emit('suggest',{result:actualResults});
				return;
			}
		socket.emit('suggest',{result:actualResults});
	});
}

function updatesvn(socket){
	try{
		exec('svn update "C:/svn/infotainment"',function(error,stdin,stderr){
			if(!error){
				console.log(stdin);
				dirMap = retriveFolders(fs.readdirSync(svnPath));
				socket.emit('svnUpdated');
			}else
				socket.emit("errorInSvn",stderr);
		});
	}catch(e){
		console.log(e);
	}
}

function retriveFolders(files , path){

	var _fullMap = [];

	for(var file in files){
		if(files[file].match(/\.svn/i)) continue;

		var currentPath = !!path ? svnPath+"/"+path+"/"+files[file] : svnPath+"/"+files[file];
	
		var stats = fs.statSync(currentPath)
		if(!!stats){
			if(stats.isFile()){ //es un archivo
				_fullMap.push(!!path ? path+"/"+files[file] : files[file]);
			}else if(stats.isDirectory()){ //es un folder
				_fullMap = _fullMap.concat(retriveFolders(fs.readdirSync(currentPath),!!path ? path+"/"+files[file] : files[file]));
			}
		}
	}

	return _fullMap;
}

exports.startFile = startFile;
exports.endFile = endFile;
exports.suggest = suggest;
exports.updatesvn = updatesvn;