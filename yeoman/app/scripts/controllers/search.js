'use strict';

fileControl.controller('Search', function($scope, $location, $rootScope, $Projects){
	localStorage.getItem("auth") === "true" ? 
		$rootScope.auth = true : $location.url("/login");

	function encodeURI(path){
		return encodeURIComponent(path.replace(/\//g,'\\'));
	}

	$scope.results = [{
		name: "Util.js",
		path: "/Buick/global/js/Util.js",
		waiting: [
			1,2,3
		]
	},{
		name: "Global.css",
		path: "/Buick/global/css/Global.css",
		waiting: [1]
	}];

	$scope.encodeURI = encodeURI;
});