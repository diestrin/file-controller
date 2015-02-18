/**
 * Contains the methods to authenticate the user
 * @type {Object}
 */
Auth = {
	/**
	 * Send a request to authenticate the user
	 * @param  {object} params 
	 *         {string}	params.user
	 *         {string} params.pass
	 * @return {null}
	 */
	"initAuth": function (params){
		var user = params.user || $user.val(),
			pass = params.pass || $pass.val();
		Util.clearLog();
		socket.emit('initAuth',{nick:user,pass:pass},Auth.handleResponse);
	},

	/**
	 * Takes the response form the server and delegates the action
	 * @param  {string} status Status of the login response
	 * @param  {*}	 	data   The corresponding data getted form the server
	 * @return {null}
	 */
	"handleResponse": function(status,data){
		switch(status){
			case "succesAuth":
				Auth.succesAuth(data);
				break;
			case "errorAuth":
				Auth.errorAuth();
				break;
			case "noUser":
				Auth.noUser(data);
				break;
			case "error":
				error(data);
				break;
		}
	},

	/**
	 * The handle function for noAuth status
	 * @param  {*}		 data
	 * @return {null}
	 */
	"noAuth": function (data) {
		Util.clearLog();
		$log.html("You are no logged in.");
	},

	/**
	 * The handle function for noUser status
	 * @param  {string}	 username	The wrong username
	 * @return {null}
	 */
	"noUser": function (username) {
		Util.clearLog();
		$log.html("There's no user "+ username);
	},

	/**
	 * The handle function for errorAuth status
	 * @return {null}
	 */
	"errorAuth": function () {
		Util.clearLog();
		$log.html("The passwor doesn't match with the user.");
	},

	/**
	 * The handle function for succesAuth status
	 * @param  {array} files The current edited files for the user
	 * @return {null}
	 */
	"succesAuth": function (files) {
		Util.clearLog();
		var _user = $user.val().length > 0 ? $user.val() : app.Base64.decode(localStorage.agent) ,
			_pass = $pass.val().length > 0 ? $pass.val() : app.Base64.decode(localStorage.agentid);
		chrome.extension.sendRequest({auth: "true",user:_user,pass:_pass});
		location.hash = "home";
	},

	/**
	 * Send a request to logout
	 * @return {null}
	 */
	"logout": function (){
		Util.clearLog();
		socket.emit('logOut');
		location.hash = 'auth';
	}
};