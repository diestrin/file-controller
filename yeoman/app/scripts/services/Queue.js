Queue = ["$http", function ($http){
	var currentQueue = [{
		name: "Util.js",
		path: "/Buick/global/js/Util.js",
		waiting: [
			1,2,3
		]
	},{
		name: "Global.css",
		path: "/Buick/global/css/Global.css",
		waiting: [1]
	}],
	globalCallback;

	function init(){
		globalCallback.call($Queue);
	}
	
	function $Queue(callback){
		globalCallback = callback;
		init();
	}

	$Queue.get = function(fileName){
		if(fileName){
			angular.forEach(currentQueue, function(file){
				if(file.name === fileName)
					return file;
			});

			return false;
		}else{
			return currentQueue;
		}
	}

	$Queue.set = function(file){
		if(currentQueue.indexOf(file) > -1){
			currentQueue.push(file);
			return true;
		}

		return false;
	}

	return $Queue;
}];