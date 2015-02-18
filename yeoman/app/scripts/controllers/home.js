'use strict';

fileControl.controller('Home', function($scope, $location, $rootScope, $routeParams, $Projects, $Queue) {
	localStorage.getItem("auth") === "true" ? 
		$rootScope.auth = true : $location.url("/login");

	$Projects(function(){
		$scope.project = this.get($routeParams.projectName, $routeParams.brandName);
	});

	$Queue(function(){
		$scope.queue = this.get();
	});

});