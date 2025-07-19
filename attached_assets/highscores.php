<?php
require('header.php');
include('includes/config.php');
include('includes/opendb.php');
?>
<div id="mcontainer" class="container">
	<div class="jumbotron">
		<div class=".container">
		<h3 class="display-5">ALL-TIME HIGH SCORES (Top 10)</h3>
		  <div class="row">
		    <div class="col-sm">
		      username
		    </div>
		    <div class="col-sm">
		      score
		    </div>
		    <div class="col-sm">
		      elapsed time
		    </div>
		    <div class="col-sm">
		      date
		    </div>
		  </div>
<?php
	$sql = "SELECT a.username,a.tscore,s.elapsedTime,s.scoredate FROM (SELECT u.username,MAX(t.score) AS tscore FROM users AS u INNER JOIN (SELECT s.score,s.elapsedTime,s.scoredate,s.uid FROM scores AS s) AS t ON u.id = t.uid GROUP BY u.username ORDER BY t.score DESC) AS a INNER JOIN scores AS s ON s.score = a.tscore GROUP BY a.username ORDER BY a.tscore DESC LIMIT 10;";
	$res = mysqli_query($conn,$sql);
	while($row = mysqli_fetch_array($res)){
		$upLevel = "";
			$getLevel = "SELECT a.aid FROM achievements AS a WHERE a.astart = (SELECT MAX(a.astart) FROM achievements AS a WHERE (SELECT MAX(s.score) FROM scores AS s INNER JOIN users AS u ON s.uid = u.id WHERE u.username = '".$row['username']."') >= a.astart);";
			  $resultLevel = mysqli_query($conn,$getLevel);
			  while($row1 = mysqli_fetch_assoc($resultLevel)){
			    $upLevel = $row1['aid'];
			  }
			$update = "UPDATE users AS u SET u.levelid= ".$upLevel." WHERE u.username = '".$row['username']."';";
			mysqli_query($conn,$update);
		echo '<div class="row greyed">';
			echo ' <div class="col-sm">';
			echo $row['username'];
			echo '</div>';
			echo ' <div class="col-sm">';
			echo $row['tscore'];
			echo '</div>';
			echo ' <div class="col-sm">';
			echo $row['elapsedTime'];
			echo '</div>';
			echo ' <div class="col-sm">';
			echo $row['scoredate'];
			echo '</div>';
		echo '</div>';
	}
?>
	</div>
</div>
	<div class="centerBoard">
			<a href="index.php">Go back to main page</a>
		</div>
</div>
<?php
	
	include('includes/closedb.php');
?>
