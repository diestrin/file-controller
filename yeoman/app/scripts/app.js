'use strict';

var fileControl = angular.module('fileControl', [], function ($provide){
	$provide.factory("$Projects", Projects);
	$provide.factory("$Queue", Queue);
})
.config(['$routeProvider', function ($routeProvider){
	$routeProvider
	.when('/login', {
		templateUrl: 'views/login.html',
		controller: 'Login'
	})
	.when('/selectProject', {
		templateUrl: 'views/selectProject.html',
		controller: 'SelectProject'
	})
	.when('/home/:projectName/:brandName', {
		templateUrl: 'views/home.html',
		controller: 'Home'
	})
	.when('/search', {
		templateUrl: 'views/search.html',
		controller: 'Search'
	})
	.when('/file/:path', {
		templateUrl: 'views/file.html',
		controller: 'File'
	})
	.otherwise({
		redirectTo: '/selectProject'
	});
}]);
