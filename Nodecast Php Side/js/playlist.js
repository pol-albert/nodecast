
document.sortable = Sortable.create(simpleList, {});

var updatePlaylist = function() {
	$.get( "/playlist.json", function(data) {
		document.sortable.destroy();
		$("#simpleList").html('');
		$(data).each(function(i,e){
			$("#simpleList").append('<li class="list-group-item">'+e.id+'</li>');
		});
		document.sortable = Sortable.create(simpleList, {});
	})
}

updatePlaylist();

setInterval(function(){ 
	updatePlaylist();
},1000);