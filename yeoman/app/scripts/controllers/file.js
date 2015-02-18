'use strict';

fileControl.controller('File', function($scope, $location, $rootScope, $routeParams, $Projects) {
	localStorage.getItem("auth") === "true" ? 
		$rootScope.auth = true : $location.url("/login");

	$scope.project = {
		key: "infotainment",
		name: {
			first: "info",
			second: "tainment"
		},
		brand: {
			name: "buick"
		}
	}

	$scope.file = {
		name: "Util.js",
		path: "/Buick/global/js/Util.js",
		waiting: [
			{
				name: "Esteban Cairol",
				rol: "current"
			},{
				name: "Diego Barahona",
				rol: "waiting"
			},{
				name: "Jorge Herrera",
				rol: "waiting"
			}
		],
	}
});