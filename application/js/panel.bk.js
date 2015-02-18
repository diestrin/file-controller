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

	Util.setView();
	Queue.fillQueue();

	$settings.bind('click',function(){
		window.open('options.html','Options','width=400,height=400,resizable=no,scrollbars=no,location=no',true)
	});

	try{
		$('#login').bind('click',Auth.initAuth);
		$('#start').bind('click',File.startFile);
		$('#end').bind('click',File.endFile);
		$('#logout').bind('click',Auth.logout);
		$fileName.bind('keyup',File.suggest);
		$suggestions.find('a .vacant').live('click',File.startFile);
		$suggestions.find('a .ocuped').live('click',File.endFile);
		$current.find('a .vacant').live('click',File.startFile);
		$current.find('a .ocuped').live('click',File.endFile);
		$update.bind('click',Util.updateSVN);
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

socket.on('disconnect',function(){
	app.init("restore");
	location.hash='auth';
	$user.val('');
	$pass.val('');
	$log.html("There's a problem with the server, try again");
});

socket.on('startFile', function (data) {
	data.fileName = data.fileName.replace(/\//g,' /');
	$suggestions.find('a').each(function(a, b){
		if( !!b.innerText.match( new RegExp( data.fileName,'gi' ) ) )
			$(b)
				.find('.vacant')
				.removeClass('vacant')
				.addClass('ocuped')
				.append('<span class="who"> -> By ' +
					data.user +
					'</span>');
	});
});

socket.on('endFile', function (data) {
	data.fileName = data.fileName.replace(/\//g,' /');

	$suggestions.find('a').each(function(a,b){
		if(!!b.innerText.match(new RegExp(data.fileName,'gi')))
			$(b)
				.find('.ocuped')
				.removeClass('ocuped')
				.addClass('vacant')
				.find('.who')
				.detach();
	});
});