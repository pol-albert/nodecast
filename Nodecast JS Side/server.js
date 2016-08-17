var http = require('http');
var url = require('url');
var exec = require('child_process').exec;
var LocalStorage = require('node-localstorage').LocalStorage;

exec('mpsyt set player mplayer');

localStorage = new LocalStorage('./localStorage');

var readJsonPlaylist = function() {
	var data = require('fs').readFileSync('../Nodecast Php Side/playlist.json', 'utf8')
	data = JSON.parse(data);
	return data;
}

var playlist = readJsonPlaylist();

localStorage.setItem('current', 0);

var stopPrevious = function(){
	var cmd = 'pkill -15 mpsyt';
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

var playRecursively = function(res) {

	console.log('Stopped : '+localStorage.getItem('stopped'));
	console.log('current : '+localStorage.getItem('current'));

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

	// var json = {};
	// json.track = playlist[parseInt(localStorage.getItem('current'))]
	// echo(res, JSON.stringify(json));

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
					localStorage.setItem('stopped',1);
					stopPrevious();

					localStorage.setItem('current', parseInt(localStorage.getItem('current')) + 1);
					
					localStorage.setItem('stopped',0);

	    			break;
	    		case 'prev':
					localStorage.setItem('stopped',1);
					stopPrevious();

					localStorage.setItem('current', parseInt(localStorage.getItem('current')) - 1);

					localStorage.setItem('stopped',0);

	    			break;
	    		case 'stop':
					localStorage.setItem('stopped',1);
					stopPrevious();
	    			break;
	    		case 'play':
					localStorage.setItem('stopped',1);
					stopPrevious();

					localStorage.setItem('stopped',0);
					playRecursively(res);

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
	    default:
			if(msg != ''){
		    	echo(msg);
			}
	    	break;
	}

});

console.log('Playlist player server launched');
localStorage.setItem('stopped',0);
playRecursively();

server.listen(8080);