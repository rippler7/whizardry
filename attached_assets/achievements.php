<?php
require('header.php');
include('includes/config.php');
include('includes/opendb.php');
$sql = "SELECT a.aname FROM achievements AS a WHERE a.astart = 
(SELECT MAX(a.astart) FROM achievements AS a WHERE (SELECT MAX(s.score) FROM scores AS s INNER JOIN users AS u ON s.uid = u.id WHERE u.username = '".$_SESSION['currUser']."') >= a.astart);";
$res = mysqli_query($conn,$sql);
$counter = mysqli_num_rows($res);
$row = mysqli_fetch_assoc($res);
$rank = 'freshie';
if($counter > 0){
	if($_SESSION['currUser'] != 'admin'){
		if($row['aname'] !== NULL){
			$rank =  $row['aname'];
		} else {
			$rank = 'freshie';
		}
		//var_dump($row['aname']);
	} else {
		$rank = 'admin';
	}
}
?>

	
 		<table class="table" style="background-color:rgb(255,255,255,0.5);text-align:center;">
 			<thead>
 				<th colspan="8"><h2>RANKING BADGES</h2></th>
 			</thead>
		  <tbody>
		    <tr>
		    	<td><img src="assets/sprites/badge_freshie.png" style="width:60%;" /></td>
		      <td><img src="assets/sprites/badge_practitioner.png" style="width:60%;" /></td>
		      <td><img src="assets/sprites/badge_noob.png" style="width:60%;" /></td>
		      <td><img src="assets/sprites/badge_commoner.png" style="width:60%;" /></td>
		      <td><img src="assets/sprites/badge_novice.png" style="width:60%;" /></td>
		      <td><img src="assets/sprites/badge_amateur.png" style="width:60%;" /></td>
		      <td><img src="assets/sprites/badge_expert.png" style="width:60%;" /></td>
		      <td><img src="assets/sprites/badge_prodigy.png" style="width:60%;" /></td>
		    </tr>
		    <tr>
		      <td>0 pts. and above</td>
		      <td>150 pts. and above</td>
		      <td>300 pts. and above</td>
		      <td>500 pts. and above</td>
		      <td>700 pts. and above</td>
		      <td>1000 pts. and above</td>
		      <td>1300 pts. and above</td>
		      <td>1500 pts. and above</td>
		    </tr>
		  </tbody>
		</table>
 	<div class="container">
 	<div class="row">
		<div class="col-sm">
			<div id="" class="card" style="width: 18rem;">
			  <img class="card-img-top" src="assets/sprites/badge_<?php echo $rank ?>.png" alt="Card image cap" style="width:150;">
			  <div class="card-body">
			    <h5 class="card-title">You are <?php if($_SESSION['currUser'] != 'admin') echo "a "; ?><span style="color:#CC5D5D;"><?php echo $rank ?></span>!</h5>
			    <p class="card-text">
			    	<?php 

			    		$ssql = "SELECT MAX(s.score) AS score FROM scores AS s INNER JOIN users AS u ON s.uid = u.id WHERE u.username = '".$_SESSION['currUser']."';";
			    		$ress = mysqli_query($conn,$ssql);
			    		$scounter = mysqli_num_rows($ress);
			    		$srow = mysqli_fetch_assoc($ress);
			    		if($scounter > 0){
			    			$score = $srow['score'];
			    		}

			    		if($rank == 'freshie'){
			    			echo "You haven't earned enough points to get a rank with points.";
			    		} else {
			    			echo "Congratulations, ".$_SESSION['currUser']."! You have earned this rank for a top score of ".$score."!";
			    		}
			    	?>
			    </p>
			    <a href="index.php" class="btn btn-primary centerBoard">Go Back</a>
			  </div>
			</div>
		</div>
		<div class="col-sm">
			<div class="jumbotron">
				
					<h3 class="display-5">TOP 3 PLAYERS PER RANKING</h3>
					  <div class="row">
					    <div class="col-sm">
					      player
					    </div>
					    <div class="col-sm">
					      score
					    </div>
					    <div class="col-sm">
					      ranking
					    </div>
					  </div>
			<?php
				$rsql = "SELECT u.username,a.aname,MAX(s.score) AS mscore FROM achievements AS a INNER JOIN users AS u ON u.levelid = a.aid INNER JOIN scores AS s ON s.uid = u.id GROUP BY a.aname ORDER BY mscore DESC;";
				$rres = mysqli_query($conn,$rsql);
				while($rrow = mysqli_fetch_array($rres)){
					$sql = "SELECT u.username, MAX(s.score) AS mscore, t.aname  FROM  users AS u INNER JOIN scores AS s ON u.id = s.uid INNER JOIN (SELECT u.username, u.id, a.aname FROM users AS u INNER JOIN achievements AS a ON u.levelid = a.aid WHERE a.aname = '".$rrow['aname']."') AS t ON u.id = t.id GROUP BY u.username ORDER BY s.score DESC LIMIT 3;";
					$res = mysqli_query($conn,$sql);
					while($row = mysqli_fetch_array($res)){
						echo '<div class="row greyed">';
							echo ' <div class="col-md">';
							echo $row['username'];
							echo '</div>';
							echo ' <div class="col-md">';
							echo $row['mscore'];
							echo '</div>';
							echo ' <div class="col-md">';
							echo $row['aname'];
							echo '</div>';
						echo '</div>';
					}
				}
			?>
				
			</div>
		</div>
 	</div>
</div>

<?php
include('includes/closedb.php');
?>