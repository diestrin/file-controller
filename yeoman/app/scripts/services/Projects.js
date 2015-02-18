Projects = ["$http", function ($http){

	var projectsJson = [
		{
			key: "infotainment",
			name: {
				first: "info",
				second: "tainment"
			},
			brands: [
				{
					name: "buick"
				},
				{
					name: "cadillac"
				},
				{
					name: "chevrolet"
				},
				{
					name: "gm"
				},
				{
					name: "gmc"
				}
			]
		},
		{
			key: "bluetooth",
			name: {
				first: "blue",
				second: "tooth"
			},
			brands: [
				{
					name: "buick"
				},
				{
					name: "cadillac"
				},
				{
					name: "chevrolet"
				}
			]
		},
		{
			key: "onstar",
			name: {
				first: "on",
				second: "star"
			},
			brands: [
				{
					name: "buick"
				},
				{
					name: "cadillac"
				},
				{
					name: "chevrolet"
				},
				{
					name: "gm"
				},
				{
					name: "gmc"
				}
			]
		},
		{
			key: "ownerscenter",
			name: {
				first: "owner's",
				second: " center"
			},
			brands: [
				{
					name: "cadillac"
				},
				{
					name: "chevrolet"
				},
				{
					name: "gmc"
				}
			]
		}
	],
	callback;
	
	function init(){
		callback.call($Projects);
	}

	function $Projects(_callback){
		callback = _callback;
		init();
	}

	$Projects.get = function (projectName, brandName){
		var tempObject = {},
			prop;

		if(projectName){
			angular.forEach(projectsJson, function (project){
				if(project.key === projectName)
					tempObject = angular.copy(project);
			});

			if(!tempObject.key) return null;

			if(brandName){
				angular.forEach(tempObject.brands, function (brand){
					if(brand.name === brandName)
						tempObject.brand = angular.copy(brand);
				});

				delete tempObject.brands;
				if(!tempObject.brand) return null;
			}

		}else{
			tempObject = projectsJson;
		}

		return tempObject;
	}

	return $Projects;
}];