<?php
if(isset($_POST['submit'])){
	include('includes/config.php');
	include('includes/opendb.php');
	$uname = mysqli_real_escape_string($conn, $_POST['uid']);
	$fname = mysqli_real_escape_string($conn, $_POST['first']);
	$lname = mysqli_real_escape_string($conn, $_POST['last']);
	$email = mysqli_real_escape_string($conn, $_POST['email']);
	$pwd = mysqli_real_escape_string($conn, $_POST['pwd']);


	if(empty($uname) || empty($fname) || empty($lname) || empty($email) || empty($pwd)){
		$_POST['mssg'] = 'One or more fields are empty.';
	} else{
		if(!preg_match("/^[a-zA-Z]*$/",$fname) || !preg_match("/^[a-zA-Z]*$/",$lname)){
			$_POST['mssg'] = "illegal characters. ";
		} else {
			if(!filter_var($email,FILTER_VALIDATE_EMAIL)){
				$_POST['mssg'] = "invalid email. ";
			} else {

				$sqlemail = "SELECT * FROM users WHERE email = '$email';";
				$resultEmail = mysqli_query($conn,$sqlemail);
				$resultCheckEmail = mysqli_num_rows($resultEmail);
				if($resultCheckEmail > 0){
					//if email already exists
					$_POST['mssg'] = "user already exists.";
				} else {

					$sql = "SELECT * FROM users WHERE username = '$uname';";
					$result = mysqli_query($conn,$sql);
					$resultCheck = mysqli_num_rows($result);

					if($resultCheck > 0){
						//if username is already taken
						$_POST['mssg'] = "user already exists.";
					} else {
						$hashed = password_hash($pwd, PASSWORD_DEFAULT);
						$sql = "INSERT INTO `users` (`first`, `last`, `username`, `password`, `email`, `totalplayed`, `levelid`) VALUES ('$fname','$lname','$uname','$hashed','$email','00:00:00',2);";
						mysqli_query($conn,$sql);
						//var_dump($sql);
						header("Location: login.php?registered=success");
						exit();
					}

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
	<title>Learn Your Way Out: Sign Up</title>
</head>
<body>
	<div id="signup" class="container">
		<div id='mssg'>
			<?php 
			if(isset($_POST['mssg'])){ 
				echo '<div class="alert alert-warning" role="alert">'.$_POST['mssg'].'</div>';
			}
			?>			
		</div>
		<form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
			<div class="form-group">
				<label for="signupUsername">Username: </label>
				<input id="signupUsername" class="form-control" type="text" name="uid" placeholder="username here" />
			</div>
			<div class="form-group">
				<label for="signUpFirst">First Name: </label>
				<input id="signUpFirst" class="form-control" type="text" name="first" placeholder="first name" />
			</div>
			<div class="form-group">
				<label for="signUpLast">Last Name: </label>
				<input id="signUpLast" class="form-control" type="text" name="last" placeholder="last name" />
			</div>
			<div class="form-group">
				<label for="signUpEmail">Email address: </label>
				<input id="signUpEmail" class="form-control" type="text" name="email" placeholder="email here" />
			</div>
			<div class="form-group">
				<label for="signUpPass">Choose Password: </label>
				<input id="signUpPass" class="form-control" type="password" name="pwd" placeholder="password" />
			</div>
			<button id="signupBtn" type="submit" name="submit" class="btn btn-primary">Sign Up</button>
		</form>
	</div>
</body>
</html>