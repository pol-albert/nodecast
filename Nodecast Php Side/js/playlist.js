// TODO : add cache for searches ? (check in chrome inspector if there isn't already a native cache)

var createSortable = function() {
	$('#simpleList .glyphicon-remove-circle').click(function(){			
		$.post('/remove.php',{id:$(this).parent().data('id')});
	})
	document.sortable = Sortable.create(simpleList, {
		onSort: function (evt) {
	    	// send new order to server
    		var newOrder = [];
	    	$("#simpleList li").each(function(i,e){
	    		newOrder.push( $(e).data('id') );
	    	});
	    	$.post("/newOrder.php",{data: JSON.stringify(newOrder)});
	    },
		onStart: function (evt) {
	    	document.preventRefresh = true;
	    },
		onEnd: function (evt) {
	    	document.preventRefresh = false;
	    }
	});
}

createSortable();

var playlist = '';

var updatePlaylistTitles = function() {
	$.get( "/playlist.json", function(data) {

		stringData = JSON.stringify(data);

		if( stringData != playlist && !document.preventRefresh ){

			playlist = stringData;

			document.sortable.destroy();
			$("#simpleList").html('');

			$.get( "/current.state", function(current) {

				$(data).each(function(i,e){
					if(i != current){
						$("#simpleList").append('<li class="list-group-item" data-ytId="'+e.ytId+'" data-id="'+e.id+'">'+e.name+'<i class="glyphicon glyphicon-remove-circle"></i></li>');
					}
					else {
						$("#simpleList").append('<li class="list-group-item active" data-ytId="'+e.ytId+'" data-id="'+e.id+'">'+e.name+'<i class="glyphicon glyphicon-remove-circle"></i></li>');
					}
				});

				createSortable();

			})

		}

		else {
			if(!document.preventRefresh) {
				$.get( "/current.state", function(current) {
					$("#simpleList .list-group-item").removeClass('active');
					$( $("#simpleList .list-group-item").get(current) ).addClass('active');
				});
			}
		}
	})
}

updatePlaylistTitles();

setInterval(function(){ 
	updatePlaylistTitles();
},1000);

$('.glyphicon-step-backward').click(function(evt){
	$.get('http://127.0.0.1:8080/playlist/prev')
})
$('.glyphicon-step-forward').click(function(evt){
	$.get('http://127.0.0.1:8080/playlist/next')
})
$('.glyphicon-stop').click(function(evt){
	$.get('http://127.0.0.1:8080/playlist/stop');
	$('.glyphicon-stop').hide();
	$('.glyphicon-play').show();
})
$('.glyphicon-play').click(function(evt){
	$.get('http://127.0.0.1:8080/playlist/play')
	$('.glyphicon-play').hide();
	$('.glyphicon-stop').show();
})

document.lastSearch = '';

$.get('/js/ytDataV3ApiKey.key',function(ytDataV3ApiKey){
	document.suggestTimeout = -1;
	$('#custom-search-input input').on('change paste keyup click',function(evt){
		if($(this).val() !== ''){
			$('#custom-search-input i').show();
			if($(this).val() !== document.lastSearch){
				if(document.suggestTimeout != -1){
					clearTimeout(document.suggestTimeout);
					document.suggestTimeout = -1;
				}

				document.suggestTimeout = setTimeout(function(){
					$('.row.search').popover('destroy');
				    gapi.client.setApiKey(ytDataV3ApiKey);
				    gapi.client.load('youtube', 'v3', function() {
				            makeRequest();
				    });
				},1500);
			}
		}
		else {
			$('#custom-search-input i').hide();
		}
	});
});

function makeRequest() {
    var q = $('#custom-search-input input').val();
    document.lastSearch = q;
    var request = gapi.client.youtube.search.list({
        q: q,
        part: 'snippet', 
        maxResults: 20
    });
    request.execute(function(response)  {
        // $('#results').empty()
        var srchItems = response.result.items;                      
        var htmlResults = "";
        $.each(srchItems, function(index, item) {               
            htmlResults += '<div class="row" data-ytid="'+item.id.videoId+'" data-name="'+item.snippet.title+'"><div class="col-md-4"><img id="thumb" src="'+item.snippet.thumbnails.default.url+'"></div><div class="col-md-8">' + item.snippet.title +  '</div></div><br/>';                      
	    })  	
		$('.row.search').popover({
			container:"body" ,
			placement:"bottom" ,
			content:htmlResults,
			html: true
		})	
		$('.row.search').popover('show');
		$('.popover .row').click(function(){
			$.post('/add.php',{ytId:$(this).data('ytid'),name:$(this).data('name')});
			$('.row.search').popover('destroy');		
		})


	})  
}

$('#custom-search-input i').click(function(){
	$('#custom-search-input input').val('');
	document.lastSearch = '';
	$('.row.search').popover('destroy');
	$(this).hide();
})



