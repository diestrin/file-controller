'use strict';

fileControl.controller('Login', function($scope, $location, $rootScope) {
	localStorage.getItem("auth") === "true" &&  $location.url("/selectProject");

	function login(){
		localStorage.setItem("auth", true);
		$rootScope.auth = true;
		$location.url("/selectProject");
	}

	$scope.login = login;
});
