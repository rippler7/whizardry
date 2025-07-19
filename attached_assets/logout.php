<?php	
session_start();
if(isset($_SESSION['is_loggedin_in'])){
	$_SESSION['is_loggedin_in'] = false;
	session_unset();
	session_destroy();
	header('Location:index.php');
	exit();
}
?>