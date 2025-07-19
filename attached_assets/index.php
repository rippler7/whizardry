<?php
require('header.php');
include('includes/config.php');
include('includes/opendb.php');
?>
<div id="mcontainer" class="container">
	<div class="jumbotron" style="text-align: center;">
		<img src="assets/sprites/logo.png" class="rounded mx-auto d-block" alt="..."style="width:50%" />
		<h1 class="display-4">
		<?php
		if(isset($_SESSION['currUser'])){
			echo "Hello, ".$_SESSION['currUser']."!";
			$sql = "SELECT a.id,a.username,a.tscore,s.elapsedTime,s.scoredate FROM (SELECT u.id,u.username,MAX(t.score) AS tscore FROM users AS u INNER JOIN (SELECT s.score,s.elapsedTime,s.scoredate,s.uid FROM scores AS s) AS t ON u.id = t.uid GROUP BY u.username ORDER BY t.score DESC) AS a INNER JOIN scores AS s ON s.score = a.tscore GROUP BY a.username ORDER BY a.tscore DESC LIMIT 10;";
			//var_dump($sql);
			$res = mysqli_query($conn,$sql);
			while($row = mysqli_fetch_array($res)){
				$upLevel = "";
					$getLevel = "SELECT a.aid FROM achievements AS a WHERE a.astart = (SELECT MAX(a.astart) FROM achievements AS a WHERE (SELECT MAX(s.score) FROM scores AS s INNER JOIN users AS u ON s.uid = u.id WHERE u.username = '".$row['username']."') >= a.astart);";
					  $resultLevel = mysqli_query($conn,$getLevel);
					  while($row1 = mysqli_fetch_assoc($resultLevel)){
					    $upLevel = $row1['aid'];
					  	}
						$tot = "SELECT SUM(timespent) as t FROM `scores` AS s WHERE s.uid ='".$row['id']."';";
						//var_dump($tot);
						$tts = 0;
						$totres = mysqli_query($conn,$tot);
						while($row2 = mysqli_fetch_assoc($totres)){
							$tts = $row2['t'];
						}
					$update = "UPDATE users AS u SET u.levelid= ".$upLevel.",u.totalplayed=".$tts." WHERE u.username = '".$row['username']."';";
					//var_dump($update);
					mysqli_query($conn,$update);
				}
			}
		?>
		</h1>
		<p class="lead">Ready to unlock your way out?</p>
		<hr class="my-4">
		<ul style="text-align: center;">
			<li><a href="intro.php">Play Game!</a></li>
			<li><a href="highscores.php">High Scores</a></li>
			<li><a href="achievements.php">Achievements</a></li>
			<li><a href="profile.php">Profile Info</a></li>
			<li><a href="logout.php">Logout</a></li>
		</ul>
	</div>
</div>
<?php
	include('includes/closedb.php');
	require('footer.php');
?>