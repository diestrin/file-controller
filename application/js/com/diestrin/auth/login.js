Import(["com.diestrin.template.template"], function(){
	window.Login = function(){

	}

	window.Login.prototype = new Template();

	window.Login.prototype = $.extend(window.Login.prototype, {
		auth: function(){

		},

		build = function(){
			var html = document.createElement("form"),
				username = document.createElement("input"),
				password = document.createElement("input"),
				refresh = document.createElement("button");
		}
	});
});