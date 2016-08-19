<?php 

	// TODO : 	add security (injection+auth) !!!!!!!!!!!!!
	//			add a check that each old playlist item is still in new playlist

	$data = $_POST['data'];
	$newPlaylistOrder = json_decode($data);

	$current = file_get_contents('current.state');

	$oldData = file_get_contents('playlist.json');
	$oldData = json_decode($oldData);

	$oldPlaylist = array();
	foreach ($oldData as $odk => $odv) {
		$oldPlaylist[$odv->id] = new \stdClass;
		$oldPlaylist[$odv->id]->id = $odv->id;
		$oldPlaylist[$odv->id]->ytId = $odv->ytId;
		$oldPlaylist[$odv->id]->name = $odv->name;
		if($odk == $current){
			$oldPlaylist[$odv->id]->current = true;
		}
		else {
			$oldPlaylist[$odv->id]->current = false;
		}
	}

	$newPlaylist = array();
	$cptCurrent = 0;

	foreach ($newPlaylistOrder as $npk => $npv) {
		if(!empty($oldPlaylist[$npv])){
			$obj = new stdClass;
			$obj->id = $npv;
			$obj->ytId = $oldPlaylist[$npv]->ytId;
			$obj->name = $oldPlaylist[$npv]->name;
			$newPlaylist[] = $obj;

			if($oldPlaylist[$npv]->current){
				error_log($cptCurrent);
				file_put_contents('current.state',$cptCurrent);
			}
			$cptCurrent++;
		}
		else {
			header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);die;
		}
	}

	file_put_contents('playlist.json', json_encode($newPlaylist), FILE_USE_INCLUDE_PATH | LOCK_EX ); 

?>