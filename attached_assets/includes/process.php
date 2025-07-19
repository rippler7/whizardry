<?php
session_start();
include('config.php');
include('opendb.php');
if (!$_SESSION['is_loggedin_in']){
	header("Location: ../login.php");
	exit;
} else {	
	if(isset($_POST['elapsedTime'])){
		$time = explode(" ",$_POST['elapsedTime']);
		$time = $time[count($time)-1];
		$score = $_POST['pScore'];
		$sqlGetId = "SELECT * FROM users WHERE username = '".$_SESSION['currUser']."'";
		$date = date('Y-m-d H:i:s');
		$res = mysqli_query($conn,$sqlGetId);
		$timespent = $_POST['totalTime'];
		if(mysqli_num_rows($res)> 0){
			$row = mysqli_fetch_assoc($res);
			$uid = $row['id'];
			$uname = $row['username'];
			$totPlay = $row['totalplayed'];
			$scoreUser = "SELECT * FROM scores WHERE uid =".$row['id'].";";
			$res2 = mysqli_query($conn,$scoreUser);
			/*
			if(mysqli_num_rows($res2) > 0){
				$sqlUpdate = "UPDATE `scores` SET `elapsedTime` = '".$time."',`score` = '".$score."',`scoredate` = '".$date."' WHERE `scores`.`uid` = '".$uid."';";
				mysqli_query($conn,$sqlUpdate);
				echo json_encode($sqlUpdate);
			} else {
				$sqlAddScore = "INSERT INTO `scores` (`elapsedTime`,`scoredate`,`score`,`uid`) VALUES ('".$time."','".$date."','".$score."',".$uid.");";
				$res3 = mysqli_query($conn,$sqlAddScore);
				echo json_encode($sqlAddScore);
			}
			*/
			$totalplaytime = $totPlay+$timespent;
			$sqlAddScore = "INSERT INTO `scores` (`elapsedTime`,`scoredate`,`score`,`timespent`,`uid`) VALUES ('".$time."','".$date."','".$score."','".$timespent."',".$uid.");";
			$res3 = mysqli_query($conn,$sqlAddScore);
			$upLevel = "";
			$getLevel = "SELECT a.aid FROM achievements AS a WHERE a.astart = (SELECT MAX(a.astart) FROM achievements AS a WHERE (SELECT MAX(s.score) FROM scores AS s INNER JOIN users AS u ON s.uid = u.id WHERE u.username = '".$_SESSION['currUser']."') >= a.astart);";
			  $resultLevel = mysqli_query($conn,$getLevel);
			  while($row = mysqli_fetch_assoc($resultLevel)){
			    $upLevel = $row['aid'];
			  }
			  $tot = "SELECT SUM(timespent) as t FROM `scores` AS s WHERE s.uid ='".$uid."';";
						// /var_dump($tot);
						$tts = 0;
						$totres = mysqli_query($conn,$tot);
						while($row2 = mysqli_fetch_assoc($totres)){
							$tts = $row2['t'];
						}
					$update = "UPDATE users AS u SET u.levelid= ".$upLevel.",u.totalplayed=".$tts." WHERE u.username = '".$_SESSION['currUser']."';";

			echo json_encode($sqlAddScore);
		}
	} else {
		die("An error has occurred.");
	} 
	
	//echo $_POST['pScore'];
}
include('closedb.php');
?>