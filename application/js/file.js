/**
 * Contains the methods to interact with files
 * @type {Object}
 */
File = {
	"startFile": function (e){
		var $this = $(this);
		e.preventDefault();
		Util.clearLog();

		socket.emit('startFile',{
			fileName : $(this)
				.find('.fileName')
				.text()
				.replace(/ \//g,'/')
		}, function(status, data){
			switch(status){
				case "inUseByYou":
					this.inUseByYou();
					break;
				case "fileInUse":
					this.fileInUse(data);
					break;
				case "noAuth":
					Auth.noAuth();
					break;
				case "error":
					Util.error(data);
				default:
					$this
						.removeClass('vacant')
						.addClass('ocuped')
						.html('<span class="fileName">' +
							$this.find('.fileName').text() +
							'</span><span class="who"> -> By You</span>');

					$current
						.append('<a href="#"><li class="ocuped"><span class="fileName">' +
							$this.find('.fileName').text() +
							'</span></li></a>');

					Queue.insertInQueue($this
						.find('.fileName')
						.text());
					break;
			}
		});
	},

	"endFile": function (e){
		e.preventDefault();
		Util.clearLog();
		var $this = $(this),
			$fileName = $this.find('.fileName').text();

		if( !!$this.find('.who').text().match(/by you/gi) || !!$current.find('a').length ){
			socket.emit('endFile',{
				fileName : $fileName.replace(/ \//g,'/')
			}, function(status, data){
				switch(status){
					case "succes":
						this.winEndFile($this, $fileName);
						break;
					case "cantEnd":
						this.cantEnd(data);
						break;
					case "noAuth":
						Auth.noAuth();
						break;
					case "error":
						Util.error(data);
						break;
				}
			});

		}else{
			$log
				.html("You are not allowed to stop the editing time of the file " +
					$fileName +
					". Just the current user, " +
					$this
						.find('.who')
						.text()
						.replace(/by /i,'') +
					", can.");
			return;
		}

		Queue.removeFromQueue( $fileName );
	},

	"suggest": function (e){
		if( this.value.length > 0 )
			socket.emit('suggest',{
				pattern : $fileName.val(),
				max : 15,
				min : 0
			},function(data){
				var html = '';
				for(var file in data.result){
					var vacant = !data.result[file].vacant.state ? "vacant" : "ocuped";
					html += '<a href="#"><li class="' +
						vacant +
						'"><span class="fileName">' +
						data.result[file].file.replace(/\//g,' /') +
						'</span>';
					
					if(data.result[file].vacant.state)
						html += '<span class="who"> -> By ' +
							data.result[file].vacant.user +
							'</span>';

					html += '</li></a>';
				}

				$suggestions.html(html);
			});
		else
			$suggestions.html('');
	},

	'fileInUse': function (data) {
		Util.clearLog();
		$log.html("The file "+data.fileName+" is been edited by "+data.user);
	},

	'cantEnd': function (data) {
		Util.clearLog();
		$log.html("You are not allowed to stop the editing time of the file " +
			data.fileName +
			". Just the current user, " +
			data.user +
			", can.");
	},

	'inUseByYou': function () {
		Util.clearLog();
		$log.html("You are currently editting this file");
	},

	"winEndFile": function ($this, $fileName){
		if( !!$this.find('.who').text().match(/by you/gi) ){
			$this
				.removeClass('ocuped')
				.addClass('vacant')
				.html('<span class="fileName">' +
					$fileName +
					'</span>');

			$current.find('a').each(function(a, b){
				if( !!b.innerText.match( new RegExp($fileName,'gi') ) )
					$(b).detach();
			});

		}else if( !!$current.find('a').length ){
			socket.emit('endFile',{
				fileName : $fileName.replace(/ \//g,'/')
			});

			$this.detach();

			$suggestions.find('a').each(function(a, b){
				if( !!b.innerText.match( new RegExp($fileName,'gi') ) )
					$(b)
						.find('.ocuped')
						.removeClass('ocuped')
						.addClass('vacant')
						.find('.who')
						.detach();
			});
		}
	}
};

/**
 * Contains the methods to interact with the queue
 * @type {Object}
 */
Queue = {
	"fillQueue": function (){
		var html = '';
		for(var file in filesQueue){
			html += '<a href="#"><li class="ocuped"><span class="fileName">' +
				filesQueue[file] +
				'</span></li></a>';
		}
		$current.html(html);
	},

	"insertInQueue": function (file){
		filesQueue.push(file);
		localStorage.filesQueue = filesQueue.join('<->');
	},


	"removeFromQueue": function (file){
		var index = filesQueue.indexOf(file);
		if(index > -1)
			filesQueue.splice(index,1);
		localStorage.filesQueue = filesQueue.join('<->');
	}
};