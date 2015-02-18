'use strict';

fileControl.controller('SelectProject', function($scope, $location, $rootScope, $Projects) {
	localStorage.getItem("auth") === "true" ? 
		$rootScope.auth = true : $location.url("/login");

	$Projects(function(){
		$scope.projects = this.get();
	});

	function openClose(_project){
		angular.forEach($scope.projects, function(project){
			if(project === _project){
				if(project.class === "open") project.class = "close" 
					else project.class = "open";
			}else if(project.class === "open") project.class = "close";
		});
	}

	$scope.openClose = openClose;
});
