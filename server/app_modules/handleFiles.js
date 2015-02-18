var fs = require("fs"),
	exec = require('child_process').exec,
	db = require("./db.js"),
	svnPath = "../svn/infotainment";

var dirMap = retriveFolders(fs.readdirSync(svnPath));

function startFile(socket , data , callback){
	if(socket.auth)
		try{
			db.checkForCurrentEditor(data.fileName , socket.user.name , function(err , file){
				if(!err){
					if(!!file){
						if(socket.user.name == file.user)
							callback('inUseByYou');
						else	
							callback('fileInUse',file);
					}else{
						db.insertFileInQueue(data.fileName , socket.user.name , function(err){
							//populateMessage(socket,'startFile',{fileName:data.fileName,user:socket.user.name});
							if(!err)
								db.insertUserQueue(data.fileName , socket.user.name , function(err){
									if(!err){
										socket.broadcast.emit('startFile');
										socket.broadcast.json.send({fileName:data.fileName,user:socket.user.name});
									}else
										callback('error',err);
								});
							else
								callback('error',err);
						});
					}
				}else
					callback('error',err);
			});
		}catch (e){
			callback('error',e);
		}
	else
		callback('noAuth');
}

function endFile(socket , data , callback){
	if(socket.auth)
		try{
			db.checkForCurrentEditor(data.fileName , socket.user.name , function(err, file) {
				if(!err){
					if(!!file){
						if(file.user == socket.user.name)
							db.extractFileInQueue(data.fileName , socket.user.name , function(err){
								if(!err)
									db.extractUserQueue(data.fileName , socket.user.name , function(err){
										if(!err){
											//populateMessage(socket,'endFile',{fileName:data.fileName,user:socket.user.name});
											socket.broadcast.emit("endFile");
											socket.broadcast.json.send({fileName:data.fileName,user:socket.user.name});
											callback('succes',data.fileName);
										}else
											callback('error',err);
									});
								else
									callback('error',err);
							});
						else
							callback('cantEnd',{fileName:data.fileName,user:file.user});
					}else
						callback('error',err);
				}else
					callback('error',err);
			});
		}catch (e){
			callback('error',e);
		}
	else
		callback('noAuth');
}

function suggest(socket , data , callback){
	var maxResults = data.max,
		startNumber = data.min,
		actualResults = []
		iterator = 0;

	data.pattern = data.pattern.replace(/(\;|\'|\:|\"|\{|\}|\[|\]|\(|\)|\,)/gi,'');
	var reg = new RegExp(data.pattern,"gi");
	console.log(data);

	db.retriveFilesFromDb(function(err,_files){
		var files;
		if(!!_files && !!_files.files)
			files = _files.files;
		else
			files = [];

		for(var item in dirMap)
			if(iterator == startNumber)
				if(iterator <= maxResults){
					if(dirMap[item].match(reg)){

						var vacant = {state: false};

						for(var file in files)
							if(files[file].fileName == dirMap[item]){

								var user = files[file].user == socket.user.name ? "You" : files[file].user;

								vacant = {
									state: true, 
									user: user
								}
								break;
							}

						actualResults.push({file:dirMap[item],vacant:vacant});
						iterator++;
					}
				}else{
					callback({result:actualResults,more:true});
					break;
				}

		callback({result:actualResults,more:false});
	});
}

function updatesvn(socket , callback){
	try{
		exec('svn update "C:/svn/infotainment"',function(error,stdin,stderr){
			if(!error){
				dirMap = retriveFolders(fs.readdirSync(svnPath));
				callback('svnUpdated');
			}else
				callback("errorInSvn",stderr);
		});
	}catch(e){
		callback('error',e);
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