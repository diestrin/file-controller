var mongo = require('mongodb-wrapper'),
	db = mongo.db('localhost', 27017, 'test');

db.collection('users');
db.collection('infotainment');

function checkForCurrentEditor(fileName , userName , callback) {
	db.infotainment.findOne({
		fileName:fileName,
		user:userName
	},callback);
}

function insertFileInQueue(fileName , userName , callback){
	db.infotainment.insert({
		fileName : fileName,
		user : userName,
		startTime : new Date().getTime()
	},callback);
}

function extractFileInQueue(fileName , userName , callback){
	db.infotainment.remove({
		fileName : fileName,
		user : userName
	},callback);
}

function retriveFilesFromDb(callback){
	db.infotainment.find({},callback);
}

function insertUserQueue(fileName , userName , callback){
	db.users.update({
		name : userName
	},{
		$push:{
			files:{
				fileName : fileName,
				startTime : new Date().getTime()
			}
		}
	},callback);
}

function extractUserQueue(fileName , userName , callback){
	db.users.update({
		name : userName
	},{
		$pull:{
			files:{
				$all:[{fileName : fileName}]
			}
		}
	},callback);
}

function selectUser(nick , callback){
	db.users.findOne({
		nick : nick
	},callback);
}

function changeUserPass(nick , pass , callback){
	db.users.update({
		nick:nick
	},{
		$set:{
			pass:pass
		}
	},callback);
}

exports.checkForCurrentEditor = checkForCurrentEditor;
exports.insertFileInQueue = insertFileInQueue;
exports.extractFileInQueue = extractFileInQueue;
exports.retriveFilesFromDb = retriveFilesFromDb;
exports.insertUserQueue = insertUserQueue;
exports.extractUserQueue = extractUserQueue;
exports.selectUser = selectUser;
exports.changeUserPass = changeUserPass;