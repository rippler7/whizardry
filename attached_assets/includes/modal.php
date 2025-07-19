<?php
session_start();
include('config.php');
include('opendb.php');
if (!$_SESSION['is_loggedin_in']){
	header("Location: ../login.php");
	exit;
} else {	
	if(isset($_POST['player'])){
		$user = $_POST['player'];
		$arr = array();
		$sql = "SELECT DISTINCT s.score, s.elapsedTime, s.scoredate,s.timespent,a.aname,u.totalplayed FROM users AS u INNER JOIN scores AS s ON u.id = s.uid INNER JOIN achievements AS a ON u.levelid = a.aid WHERE u.username = '".$user."' AND s.score > 0  ORDER BY s.scoredate DESC;";
		$res = mysqli_query($conn,$sql);
		while($row = mysqli_fetch_array($res)){
			$arr[]=$row;
		}
		echo json_encode($arr);
	}elseif(isset($_POST['fetch'])){
			$sql = "SELECT question,answer,level FROM questions_answers";
			$res = mysqli_query($conn,$sql);
			$package = array();
			while($row = mysqli_fetch_array($res)){
				$package[] = $row;
			}
		echo json_encode($package);
		} 

	else {
		echo "An error has occurred.";
	}
}
include('closedb.php');
?>