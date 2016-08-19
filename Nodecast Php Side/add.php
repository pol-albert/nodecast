<?php 

	// TODO : 	add security (injection+auth) !!!!!!!!!!!!!

	$newItem = $_POST;

	$playlist = file_get_contents('playlist.json');
	$playlist = json_decode($playlist);
	$newItem['id'] = uniqid();
	$playlist[] = $newItem;

	file_put_contents('playlist.json', json_encode($playlist), FILE_USE_INCLUDE_PATH | LOCK_EX ); 

?>