<?php
$db_host = 'localhost';		//server name
$db_user = 'root';			//database username
$db_pass = '';				//database password
$db_name = 'test';				//database name
$admin = 'admin';
$adpass = 'admin';
$adminpass = password_hash($adpass, PASSWORD_DEFAULT);
global $datemod;
//var_dump($adminpass);
//set current date/time before updating the DB
$datemod = date("y/m/d : H:i:s", Time());
?>