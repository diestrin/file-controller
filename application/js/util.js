/**
 * Contains all the util fuctions
 * @type {Object}
 */
Util = {
	/**
	 * Set the view in the panel accordin with the user status
	 * @return {null}
	 */
	"setView": function (){
		this.clearLog();
		if(location.hash == "" && !app.auth && !localStorage.agent)
			location.hash = "auth";
		else if(!app.auth && !!localStorage.agent)
			Auth.initAuth({
				user:app.Base64.decode(localStorage.agent),
				pass:app.Base64.decode(localStorage.agentid)
			});
		else if(!!app.auth)
			location.hash = "home";
	},

	/**
	 * Clear the log in the panel
	 * @return {null}
	 */
	"clearLog": function (){
		$log.html('');
	},

	/**
	 * Displays the error log
	 * @param  {string} data The error data
	 * @return {null}
	 */
	"error": function (data) {
		this.clearLog();
		$log.html("An error has ocurre: " + data);
	},

	/**
	 * Send an event to update the trunk in the server
	 * @return {null}
	 */
	"updateSVN": function (){
		this.clearLog();
		socket.emit('updateSVN',this.updateSVNCB);
	},

	/**
	 * Handle the response form the server for update the svn
	 * @param  {string} status 	The status of the response
	 * @param  {string} data 	The data od the error
	 * @return {null}
	 */
	"updateSVNCB": function(status, data){
		switch(status){
			case "svnUpdated":
				$log.html("The SVN has been updated");
				setTimeout(this.clearLog,5000);
				break;
			case "errorInSvn":
			case "error":
				this.error(data);
				break;
		}
	}
};