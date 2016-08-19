<?php 

	// TODO : 	add security (injection+auth) !!!!!!!!!!!!!

	$playlist = file_get_contents('playlist.json');
	$playlist = json_decode($playlist);
	
	foreach ($playlist as $key => $value) {
		if($value->id == $_POST['id']){
			unset($playlist[$key]);
		}
	}

	$current = file_get_contents('current.state');
	$current++;
	if($current > count($playlist)-1) {
		$current = 0;
	}
	file_put_contents('current.state',$current);
	error_log($current);

	file_put_contents('playlist.json', json_encode($playlist), FILE_USE_INCLUDE_PATH | LOCK_EX ); 

?>