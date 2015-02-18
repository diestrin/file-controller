var socket = {},
	auth = false;

localStorage["showPopups"] = !!localStorage["showPopups"] ? localStorage["showPopups"] : 'true';
localStorage["delay"] = !!localStorage["delay"] ? localStorage["delay"] : 10000;
chrome.browserAction.onClicked.addListener(openController);

$(document).ready(onInit);

function init(){
	auth = false;
	script = document.getElementById('script');

	if(script)
		document.getElementsByTagName('head')[0].removeChild(script);

	script = document.createElement('script');
	script.id = "script";

	script.onload = function(){
		setTimeout(onInit, 1000);
	}

	script.onerror = function(){
		setTimeout(init, 1000);
	}

	//script.src = 'http://nodejs.boszdigital.com:8877/socket.io/socket.io.js';
	script.src = 'https://localhost:8877/socket.io/socket.io.js';

	$('head')[0].appendChild(script); //Esto no debe de ir con jquey, tiene que ir con JavaScript puro
}

function onInit(restore){
	try{
		auth = false;
		//socket = io.connect('http://nodejs.boszdigital.com:8877');
		socket = io.connect('https://localhost:8877');
	}catch(e){
		setTimeout(onInit, 500);
		return;
	}

	localStorage.filesQueue = '';

	openController("reload");

	chrome.extension.onRequest.addListener(function(data){
	    if(data.auth){
	    	localStorage['agent'] = Base64.encode(data.user);
	    	localStorage['agentid'] = Base64.encode(data.pass);
	    }
	    auth = true;
	});

	socket.on('startFile', function (data) {
		notificacion(data.fileName+' in use.',data.user+" starts editing the file "+data.fileName);
	});

	socket.on('endFile', function (data) {
		notificacion(data.fileName+' available.',"The file "+data.fileName+" is now ready avaliable. The last user was "+data.user);
	});
}

function openController(reload){
	var views = chrome.extension.getViews(),
		panelActive = false,
		panelNumber;
		
	for(var view in views)
		if(views[view].name =="panel"){
			panelActive = true;
			panelNumber = view;
		}

	if(!panelActive)
		chrome.windows.create({url:"./html/panel.html",width:400,height:450,focused:true,type:'panel'});
	else if(!!panelActive && reload == "reload")
		views[panelNumber].Util.setView();

}

function notificacion(title,content){
	if(localStorage["showPopups"] == 'true'){
		var notification = webkitNotifications.createNotification(
			'../img/icon.png',
			title,
			content
		);
		notification.ondisplay = function(){
			var ti=setInterval(function(){
				notification.cancel();
				clearInterval(ti);
			},parseInt(localStorage["delay"]));
		}
		notification.onclick = function(){
			//notification.cancel();
		};
		notification.show();
	}
}

var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
	    var output = "";
	    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	    var i = 0;

	    input = Base64._utf8_encode(input);

	    while (i < input.length) {

	        chr1 = input.charCodeAt(i++);
	        chr2 = input.charCodeAt(i++);
	        chr3 = input.charCodeAt(i++);

	        enc1 = chr1 >> 2;
	        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	        enc4 = chr3 & 63;

	        if (isNaN(chr2)) {
	            enc3 = enc4 = 64;
	        } else if (isNaN(chr3)) {
	            enc4 = 64;
	        }

	        output = output +
	        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
	        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

	    }

	    return output;
	},

	// public method for decoding
	decode : function (input) {
	    var output = "";
	    var chr1, chr2, chr3;
	    var enc1, enc2, enc3, enc4;
	    var i = 0;

	    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	    while (i < input.length) {

	        enc1 = this._keyStr.indexOf(input.charAt(i++));
	        enc2 = this._keyStr.indexOf(input.charAt(i++));
	        enc3 = this._keyStr.indexOf(input.charAt(i++));
	        enc4 = this._keyStr.indexOf(input.charAt(i++));

	        chr1 = (enc1 << 2) | (enc2 >> 4);
	        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	        chr3 = ((enc3 & 3) << 6) | enc4;

	        output = output + String.fromCharCode(chr1);

	        if (enc3 != 64) {
	            output = output + String.fromCharCode(chr2);
	        }
	        if (enc4 != 64) {
	            output = output + String.fromCharCode(chr3);
	        }

	    }

	    output = Base64._utf8_decode(output);

	    return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
	    string = string.replace(/\r\n/g,"\n");
	    var utftext = "";

	    for (var n = 0; n < string.length; n++) {

	        var c = string.charCodeAt(n);

	        if (c < 128) {
	            utftext += String.fromCharCode(c);
	        }
	        else if((c > 127) && (c < 2048)) {
	            utftext += String.fromCharCode((c >> 6) | 192);
	            utftext += String.fromCharCode((c & 63) | 128);
	        }
	        else {
	            utftext += String.fromCharCode((c >> 12) | 224);
	            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	            utftext += String.fromCharCode((c & 63) | 128);
	        }

	    }

	    return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
	    var string = "";
	    var i = 0;
	    var c = c1 = c2 = 0;

	    while ( i < utftext.length ) {

	        c = utftext.charCodeAt(i);

	        if (c < 128) {
	            string += String.fromCharCode(c);
	            i++;
	        }
	        else if((c > 191) && (c < 224)) {
	            c2 = utftext.charCodeAt(i+1);
	            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
	            i += 2;
	        }
	        else {
	            c2 = utftext.charCodeAt(i+1);
	            c3 = utftext.charCodeAt(i+2);
	            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
	            i += 3;
	        }

	    }

	    return string;
	}

}