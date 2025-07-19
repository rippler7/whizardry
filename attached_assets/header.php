<?php
session_start();
if (!$_SESSION['is_loggedin_in']){
	header("Location: login.php");
	exit;
}
?>
<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<link rel="stylesheet" href="css/reset.css" />
	<link rel="stylesheet" href="style.css" />
	<?php
		if(isset($page)){
			if($page == 'intro'){
				echo '<link rel="stylesheet" href="intro.css" />';
			}
		}
	?>
	<link rel="stylesheet" href="css/bootstrap-grid.min.css" />
	<link rel="stylesheet" href="css/bootstrap.min.css" />
	<script src="js/jquery-3.3.1.min.js"></script>
	<script src="js/popper.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<title></title>
</head>
<body>