<?php
session_start();
if ($_SESSION['is_loggedin_in'] == true) {
	?>
	<!DOCTYPE html>
	<html>

	<head>
		<title></title>
		<link rel="stylesheet" href="css/reset.css" />
		<link rel="stylesheet" href="style.css" />
		<script src="js/jquery-3.3.1.min.js"></script>
		<script src="js/phaser.min.js"></script>
		<script src="js/random.js"></script>
		<script src="js/dt.js"></script>
		<script src="js/chestClass.js"></script>
		<script src="js/doorClass.js"></script>
		<script src="js/bulletClass.js"></script>
		<script src="js/skeletonClass.js"></script>
		<script src="js/zombieClass.js"></script>
		<script src="js/batClass.js"></script>
		<script src="js/bossClass.js"></script>
		<script src="js/script.js"></script>
	</head>

	<body>
		<div id="mainContainer">
			<div id="upper">
				<div id="scoreBoard">Player Life: 100</div>
				<div id="enemyCounter">Skeletons Left:</div>
				<div id="zombieCounter">Zombies Left:</div>
				<div id="bossBoard">Boss Life: 30</div>
			</div>
			<div id="gameState">Press 'p' to pause.</div>
			<div id="screen">
				&nbsp;
			</div>
		</div>
	</body>

	</html>
	<?php
} else {
	header("Location: login.php");
	exit;
}
?>