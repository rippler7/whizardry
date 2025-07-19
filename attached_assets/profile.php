<?php
require('header.php');
include('includes/config.php');
include('includes/opendb.php');
?>
<div class="jumbotron">
<?php
if($_SESSION['currUser'] !== 'admin'){
?>
<div><h2>My recent scores</h2></div>
<table class="table">
  <thead>
    <tr>
      <th>score</th>
      <th>elapsed time</th>
      <th>score date</th>
      <th>time spent (seconds)</th>
    </tr>
  </thead>
  <tbody>
<?php
	$sql = "SELECT DISTINCT s.score, s.elapsedTime, s.scoredate,s.timespent,u.totalplayed FROM users AS u INNER JOIN scores AS s ON u.id = s.uid WHERE u.username = '".$_SESSION['currUser']."'  ORDER BY s.scoredate DESC;";
	$res = mysqli_query($conn,$sql); 
	$tots = '';
	while($row = mysqli_fetch_array($res)){
				$tots = $row['totalplayed'];
					echo '<tr>';
						echo ' <td>';
						echo $row['score'];
						echo '</td>';
						echo ' <td>';
						echo $row['elapsedTime'];
						echo '</td>';
						echo ' <td>';
						echo $row['scoredate'];
						echo '</td>';
						echo ' <td>';
						echo $row['timespent'];
						echo '</td>';
					echo '</tr>';
	}
	$tots = "total time: ".$tots;
	echo '<tr><td colspan="3">&nbsp;</td><td id="totalTime">'.$tots.'</td></tr>';
?>
  </tbody>
 </table>
<?php
} else {
	?>
	<div><h2>Recent scores per player</h2></div>
	<table class="table">
	  <thead>
	    <tr>
	      <th scope="col">player</th>
	      <th scope="col">score</th>
	      <th scope="col">elapsed time</th>
	      <th scope="col">score date</th>
	      <th scope="col">time spent  (in seconds)</th>
	      <th scope="col">details</th>
	    </tr>
	  </thead>
	  <tbody>
	<?php
	$asql = "SELECT * FROM (SELECT DISTINCT u.username, s.score, s.elapsedTime, s.scoredate, s.timespent FROM scores AS s INNER JOIN users AS u ON s.uid = u.id WHERE s.score > 0 ORDER BY s.scoredate DESC) as t GROUP BY t.username ORDER BY t.scoredate DESC;";
	$ares = mysqli_query($conn,$asql);
	while($row = mysqli_fetch_array($ares)){
		echo '<tr>';
						echo ' <td>';
						echo $row['username'];
						echo '</td>';
						echo ' <td>';
						echo $row['score'];
						echo '</td>';
						echo ' <td>';
						echo $row['elapsedTime'];
						echo '</td>';
						echo ' <td>';
						echo $row['scoredate'];
						echo '</td>';
						echo ' <td>';
						echo $row['timespent'];
						echo '</td>';
						echo ' <td>';
						echo "<button type='button' class='btn btn-primary' data-toggle='modal' data-target='#ModalLong' data-player='".$row['username']."'onclick='javascript:sendData(\"".$row['username']."\");'>view</button>";
						echo "</td>";
					echo '</tr>';
	}
	?>
  </tbody>
 </table>
<?php
}
?>
<a href="index.php" class="btn btn-primary centerBoard">Go Back</a>
</div>
<div class="modal fade" id="ModalLong" tabindex="-1" role="dialog" aria-labelledby="playerDetails" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="playerDetails">Player Score Info</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        	<table class="table">
			  <thead>
			  	<tr>
			  		<th id="rankBox"></th>
			  		<th colspan="2">Total Play Time: <span id="totalplay" style="font-size:2em;color:#5D5D5D;"></span></th>
			  		<th>Topscore: <span id="topScore" style="font-size:2em;"></span></th>
			  	</tr>
			    <tr>
			      <th scope="col">Score</th>
			      <th scope="col">Play Date</th>
			      <th scope="col">Elapsed Time</th>
			      <th scope="col">Time Spent (in seconds)</th>
			    </tr>
			  </thead>
			  <tbody id="showText">
			</tbody>
			</table>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
<script>
	function sendData(n){
		 $.ajax({
		  	url:'includes/modal.php',
			method:"POST",
			data:{player:n},
		  	method:"POST",
		  	success:function(dt){
		  		var modal = $('#ModalLong');
		  		var contents=JSON.parse(dt);
		  		var rank;
		  		var ts =[];
		  		var tot;
		  		console.log(dt);
		  		console.log(ts);
		  		var combined ='';
		  		$(contents).each(function(v,i){
		  			combined+="<tr class='greyed'><td>"+i.score+"</td><td>"+i.scoredate+"</td><td>"+i.elapsedTime+"</td><td>"+i.timespent+"</td></tr>";
		  			rank = i.aname;
		  			ts[v] = i.score;
		  			tot=i.totalplayed;
		  		});
		  		var totTime = SecondsTohhmmss(tot);
		  		modal.find('#showText').html(combined);
		  		modal.find('#totalplay').html(totTime);
		  		if(n == 'admin'){
		  			rank = 'admin';
		  		}
		  		$('#rankBox').html('<img src="assets/sprites/badge_'+rank+'.png" style="width:50%;" />');
		  		$('#topScore').html(Math.max(...ts));
		  	}
		  });
	}
	$('#ModalLong').on('show.bs.modal', function (event) {
	  var button = $(event.relatedTarget) // Button that triggered the modal
	  var recipient = button.data('player') // Extract info from data-* attributes
	  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
	  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
	  var modal = $(this);
	  $('#showText').html(recipient);
	  modal.find('.modal-title').html('Player Info on <span style="color:#FF0000">' + recipient + '</span>');
	});
	var SecondsTohhmmss = function(totalSeconds) {
	  var hours   = Math.floor(totalSeconds / 3600);
	  var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
	  var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

	  // round seconds
	  seconds = Math.round(seconds * 100) / 100

	  var result = (hours < 10 ? "0" + hours : hours);
	      result += ":" + (minutes < 10 ? "0" + minutes : minutes);
	      result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
	  return result;
	}
</script>
<?php
include('includes/closedb.php');
?>