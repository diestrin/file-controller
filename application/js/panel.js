var app = chrome.extension.getBackgroundPage(),
	name = 'panel',
	socket = app.socket,
	filesQueue = !!localStorage.filesQueue ? localStorage.filesQueue.split('<->') : [];

$(document).ready(function(){		
	$log = $('#log'),
	$user = $('#user'),
	$pass = $('#pass'),
	$suggestions = $('#suggestions'),
	$current = $('#current'),
	$fileName = $('#fileName');
	$settings = $('#settings');
	$update = $('#update');

	setView();
	fillQueue();

	$settings.bind('click',function(){
		window.open('options.html','Options','width=400,height=400,resizable=no,scrollbars=no,location=no',true)
	});

	try{
		$('#login').bind('click',initAuth);
		$('#start').bind('click',startFile);
		$('#end').bind('click',endFile);
		$('#logout').bind('click',logout);
		$fileName.bind('keyup',suggest);
		$suggestions.find('a .vacant').live('click',startFile);
		$suggestions.find('a .ocuped').live('click',endFile);
		$current.find('a .vacant').live('click',startFile);
		$current.find('a .ocuped').live('click',endFile);
		$update.bind('click',updateSVN);
	}catch(e){
		app.init();
		location.hash='auth';
		$user.val('');
		$pass.val('');
		$log.html("There's a problem with the server, try again");
	}

	if(!socket.socket.connected){
		setTimeout(app.init, 500);
	}
});

socket.on('fileInUse', function (data) {
	clearLog();
	$log.html("The file "+data.fileName+" is been edited by "+data.user);
});

socket.on('cantEnd', function (data) {
	clearLog();
	$log.html("You are not allowed to stop the editing time of the file "+data.fileName+". Just the current user, "+data.user+", can.");
});

socket.on('inUseByYou', function (data) {
	clearLog();
	$log.html("You are currently editting this file");
});

socket.on('errorAuth', function (data) {
	clearLog();
	$log.html("The user or the password did not match");
});

socket.on('alreadyAuth', function (data) {
	clearLog();
	$log.html("The user is already logged in");
});

socket.on('noAuth', function (data) {
	clearLog();
	$log.html("You are no logged in");
});

socket.on('succesAuth', function (data) {
	clearLog();
	var _user = $user.val().length > 0 ? $user.val() : app.Base64.decode(localStorage.agent) ,
		_pass = $pass.val().length > 0 ? $pass.val() : app.Base64.decode(localStorage.agentid);
	chrome.extension.sendRequest({auth: "true",user:_user,pass:_pass});
	location.hash = "home";
});

socket.on('startFile', function (data) {
	data.fileName = data.fileName.replace(/\//g,' /');
	$suggestions.find('a').each(function(a,b){
		if(!!b.innerText.match(new RegExp(data.fileName,'gi')))
			$(b).find('.vacant').removeClass('vacant').addClass('ocuped').append('<span class="who"> -> By '+data.user+'</span>');
	});
});

socket.on('endFile', function (data) {
	data.fileName = data.fileName.replace(/\//g,' /');
	$suggestions.find('a').each(function(a,b){
		if(!!b.innerText.match(new RegExp(data.fileName,'gi')))
			$(b).find('.ocuped').removeClass('ocuped').addClass('vacant').find('.who').detach();
	});
});

socket.on('suggest', function (data){
	var html = '';
	for(var file in data.result){
		var vacant = !data.result[file].vacant.state ? "vacant" : "ocuped";
		html += '<a href="#"><li class="'+vacant+'"><span class="fileName">'+data.result[file].file.replace(/\//g,' /')+'</span>';
		
		if(data.result[file].vacant.state)
			html += '<span class="who"> -> By '+data.result[file].vacant.user+'</span>';

		html += '</li></a>';
	}
	$suggestions.html(html);
});

socket.on('svnUpdated',function(){
	$log.html('The SVN has been updated');
});

socket.on('disconnect',function(){
	app.init("restore");
	location.hash='auth';
	$user.val('');
	$pass.val('');
	$log.html("There's a problem with the server, try again");
});

function setView(){
	clearLog();
	if(location.hash == "" && !app.auth && !localStorage.agent)
		location.hash = "auth";
	else if(!app.auth && !!localStorage.agent)
		socket.emit('initAuth',{nick:app.Base64.decode(localStorage.agent),pass:app.Base64.decode(localStorage.agentid)});
	else
		location.hash = "home";
}

function updateSVN(){
	clearLog();
	socket.emit('updateSVN');
}

function fillQueue(){
	var html = '';
	for(var file in filesQueue){
		html += '<a href="#"><li class="ocuped"><span class="fileName">'+filesQueue[file]+'</span></li></a>';
	}
	$current.html(html);
}

function insertInQueue(file){
	filesQueue.push(file);
	localStorage.filesQueue = filesQueue.join('<->');
}

function removeFromQueue(file){
	var index = filesQueue.indexOf(file);
	if(index > -1)
		filesQueue.splice(index,1);
	localStorage.filesQueue = filesQueue.join('<->');
}

function initAuth(){
	clearLog();
	socket.emit('initAuth',{nick:$user.val(),pass:$pass.val()});
}

function startFile(e){
	e.preventDefault();
	clearLog();
	socket.emit('startFile',{fileName:$(this).find('.fileName').text().replace(/ \//g,'/')});
	$(this).removeClass('vacant').addClass('ocuped').html('<span class="fileName">'+$(this).find('.fileName').text()+'</span><span class="who"> -> By You</span>');
	$current.append('<a href="#"><li class="ocuped"><span class="fileName">'+$(this).find('.fileName').text()+'</span></li></a>');
	insertInQueue($(this).find('.fileName').text());
}

function endFile(e){
	e.preventDefault();
	clearLog();
	var $fileName = $(this).find('.fileName').text();
	if(!!$(this).find('.who').text().match(/by you/gi)){
		socket.emit('endFile',{fileName:$fileName.replace(/ \//g,'/')});
		$(this).removeClass('ocuped').addClass('vacant').html('<span class="fileName">'+$fileName+'</span>');
		$current.find('a').each(function(a,b){
			if(!!b.innerText.match(new RegExp($fileName,'gi')))
				$(b).detach();
		});
	}else if(!!$current.find('a').length){
		socket.emit('endFile',{fileName:$fileName.replace(/ \//g,'/')});
		$(this).detach();
		$suggestions.find('a').each(function(a,b){
			if(!!b.innerText.match(new RegExp($fileName,'gi')))
				$(b).find('.ocuped').removeClass('ocuped').addClass('vacant').find('.who').detach();
		});
	}else{
		$log.html("You are not allowed to stop the editing time of the file "+$fileName+". Just the current user, "+$(this).find('.who').text().replace(/by /i,'')+", can.");
		return;
	}
	removeFromQueue($fileName);
}

function logout(e){
	clearLog();
	socket.emit('logOut');
	location.hash = 'auth';
}

function clearLog(){
	$log.html('');
}

function suggest(e){
	if(this.value.length > 0)
		socket.emit('suggest',{pattern:$fileName.val()});
	else
		$suggestions.html('')
}