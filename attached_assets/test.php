<?php 
session_start();
include('includes/config.php');
include('includes/opendb.php');
$time = new DateTime();
$time->setTime(0,0,86400);
$base =  $time->format('H:i:s');
$sql = "SELECT question,answer,level FROM questions_answers";
$res = mysqli_query($conn,$sql);
$package = array();
while($row = mysqli_fetch_array($res)){
	$package[] = $row;
}
echo json_encode($package);
include('includes/closedb.php');
?>