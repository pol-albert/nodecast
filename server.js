var http = require('http');
var url = require('url');
var exec = require('child_process').exec;
var LocalStorage = require('node-localstorage').LocalStorage;

exec('mpsyt set player mplayer');

localStorage = new LocalStorage('./localStorage');

var readJsonPlaylist = function() {
	var data = require('fs').readFileSync('./playlist.json', 'utf8')
	data = JSON.parse(data);
	return data;
}

var playlist = readJsonPlaylist();

localStorage.setItem('current', 0);

var stopPrevious = function(){
	var cmd = 'pkill -15 mplayer';
	exec(cmd, function(error, stdout, stderr) {
	});
}

var echo = function(res, message) {
	if(typeof(res) !== 'undefined'){
	    res.writeHead(200, {"Content-Type": "application/json"});
		res.write(message);
		res.end();
	}
	delete res;
}

var playRecursively = function(res, action) {


	if(localStorage.getItem('stopped') == 1 ) {
		return;
	}
	
	// reload the playlist file here everytime
	
	if(parseInt(localStorage.getItem('current')) < 0) {
		localStorage.setItem('current', playlist.length - 1);
	}

	if(typeof(playlist[parseInt(localStorage.getItem('current'))]) == 'undefined') {
		localStorage.setItem('current', 0);
	}

	if( typeof(action) !== 'undefined' ){
		var json = {};
		json.track = playlist[parseInt(localStorage.getItem('current'))]
		json.action = typeof(action) !== 'undefined' ? action : '';
		echo(res, JSON.stringify(json));
	}

	var cmd = 'mpsyt playurl '+playlist[parseInt(localStorage.getItem('current'))].id;
	
	exec(cmd, function(error, stdout, stderr) {

		if (error && stderr.indexOf('Terminated') !== -1) {

		}
		else {
			localStorage.setItem( 'current', parseInt(localStorage.getItem('current')) + 1 );
		}	

		playRecursively(res);

	});

}


var server = http.createServer(function(req, res) {

    var endpoint = url.parse(req.url).pathname;

    endpoint = endpoint.split('/');

    var msg = '';

    switch(endpoint[1]) {
	    case 'playlist':
    		switch(endpoint[2]) {
	    		case 'next':
					localStorage.setItem('current', parseInt(localStorage.getItem('current')) + 1);
					stopPrevious();

					if(localStorage.getItem('stopped') == 1) {
						localStorage.setItem('stopped',0);
						playRecursively(res, 'next');
					}

	    			break;
	    		case 'prev':
					localStorage.setItem('current', parseInt(localStorage.getItem('current')) - 1);
					stopPrevious();

					if(localStorage.getItem('stopped') == 1) {
						localStorage.setItem('stopped',0);
						playRecursively(res, 'prev');
					}

	    			break;
	    		case 'stop':
					localStorage.setItem('stopped',1);
					stopPrevious();

					var json = {"action":"stop"};
					echo(res, JSON.stringify(json));

	    			break;
	    		case 'play':
					localStorage.setItem('stopped',1);
					stopPrevious();

					localStorage.setItem('stopped',0);
					playRecursively(res, 'play');

	    			break;
	    		default:
	    			break;
	        }
	        break;
	    case 'play':
	    	if(typeof(endpoint[2]) == 'undefined' || endpoint[2] == ''){
		    	msg = 'Missing yt id';
	    	}
	    	else {
		    	msg = 'Playing track of id ' + endpoint[2];

				var cmd = 'mpsyt playurl ' + endpoint[2];
				exec(cmd, function(error, stdout, stderr) {
				});
	    	}
	        break;
	    default:
	    	break;
	}

	if(msg != ''){
    	echo(msg);
	}

});

console.log('Playlist player server launched');
localStorage.setItem('stopped',0);
playRecursively();

server.listen(8080);