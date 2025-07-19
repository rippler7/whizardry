<?php 
session_start();
	if(isset($_POST['submit'])){
		include('includes/config.php');
		include('includes/opendb.php');
		$uname = mysqli_real_escape_string($conn, $_POST['uid']);
		$pwd = mysqli_real_escape_string($conn, $_POST['pwd']);

		if(empty($uname) || empty($pwd)){
			$_POST['mssg'] = "a field is empty";
		} else{
			$sql = "SELECT * FROM users WHERE username='$uname'";
			$result = mysqli_query($conn,$sql);
			//var_dump($result);
			$resultCheck = mysqli_num_rows($result);
			if($resultCheck < 1){
				$_POST['mssg'] = "username/password does not exist.";
			} else {
				if($row = mysqli_fetch_assoc($result)){
					$hashedCheck = password_verify($pwd,$row['password']);
					if($hashedCheck == false){
						$_POST['mssg'] = 'username/password does not exist.';
					} elseif($hashedCheck == true) {
						$_SESSION['currUser'] = $row['username'];
						$_SESSION['currUserFirst'] = $row['first']; 
						$_SESSION['currUserLast'] = $row['last']; 
						$_SESSION['currUserEmail'] = $row['email'];  
						$_SESSION['is_loggedin_in'] = true;
						header("Location: index.php");
						exit();
					}
				}
			}
		}

		include('includes/closedb.php');
	}
?>
<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<link rel="stylesheet" href="css/reset.css" />
	<link rel="stylesheet" href="style.css" />
	<link rel="stylesheet" href="css/bootstrap-grid.min.css" />
	<link rel="stylesheet" href="css/bootstrap.min.css" />
	<script src="js/jquery-3.3.1.min.js"></script>
	<script src="js/popper.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<title>Learn Your Way Out: Login</title>
</head>
<body>
	<div id="login" class="container">
		<img src="assets/sprites/logo.png" class="rounded mx-auto d-block" alt="..."style="width:50%" />
		<div id="mssg"><?php if (isset($_POST['mssg'])){
			echo '<div class="alert alert-warning" role="alert">'.$_POST['mssg'].'</div>';
		} ?></div>
		<div id="success"><?php if (isset($_GET['registered'])){
			if($_GET['registered'] == 'success'){
				echo '<div class="alert alert-success" role="alert">You have successfully registered!</div>';;
			}
		} ?></div>
		<form method="POST" action="<?php $_SERVER['PHP_SELF']; ?>">
			<div class="form-group">
				<label for="loginUsername">Username: </label>
				<input id="loginUsername" class="form-control" type="text" name="uid" placeholder="username here" />
			</div>
			<div class="form-group">
				<label for="loginPass">Username: </label>
				<input id="loginPass" class="form-control" type="password" name="pwd" placeholder="password" />
			</div>
			<button class="btn btn-primary centerBoard" type="submit" name="submit">Submit</button>
		</form>
		<hr />
		<div class="centerBoard">
			Haven't registered yet?
			<a href="signup.php">Sign up here!</a>
		</div>
	</div>
</body>
</html>