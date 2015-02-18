var mongo = require('mongodb-wrapper'),
	db = mongo.db('localhost', 27017, 'test');

db.collection('infotainment');

