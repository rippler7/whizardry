var game;
var playerChar;
var bossChar;
var baddies1;
var baddies2;
var baddies3;

var maxFrameRate = 12;
var map,mapDoodads,mapWalls,mapLayer2,crystalLayerRed,crystalLayerBlue,crystalLayerGreen,crystalLayerYellow,cRed,cBlue,cGreen,cYellow,cLayerR,cLayerB,cLayerG,cLayerY;
var cursors, spacebar;
var flipX = false;
var flipY = true;
var activeDir = "Y";
var maxFrameRate = 24;
var walkSpeed = (maxFrameRate/12)*80;
var speed;
var cactus;
var playerAns = "A";
var scoreText;
var playerScore = 0;
var gameStat = 'active';
var queBoss = false;
var timeFactor = 0;

var gameMode = 1;
var playerLife = 200;
var Enemies = 80;
var BatCount = 35;
var ZombieCount = Math.floor(Enemies/3);
var enemyCount = Enemies;
var batties;
var skeletonDamage = 3;
var batDamage = 5;
var zombieDamage = skeletonDamage;
var bossMaxLife = 50;
var bossLife = bossMaxLife;
var skeletonMaxLife = 3;
var zombieMaxLife = 10;
var batMaxLife = 4;

var debug = false;

var bullets;
var lastFired = 0;
var fire;
var cursors;
var spacebar;
var angle2;
var randX = [];
var randY = [];
var gun;

var fire;
var fireBall;
var badguys = [];
var runOnce = 0;

var gCount = 0;
var enemyHit;
var enemyCounter = 0;
var jungle;
var arcade;
var bossAttackStat = 0;
var clocker;

var star;
var playerHurt;
var burst;
var spitting;
var doorLock;
var doorOpen;
var doorClose;
var bossTheme;
var defeat;
var layer3;
var runOnce = 0;
var level = 1;
var letterChosen;
var choiceIndex = 10;
var currentLevel = 0;
var qDisplay;
var bossHurting = false;

var choiceRed,choiceBlue,choiceGreen,choiceYellow;

var questions = [];
var res = []; //answers
var ls = []; //levels
var ans = []; //x are needed as keys for areas without choices
var qSet = [];
var choiceSets = [];
var shuffledSet;
var gateLocations = [];
var SelectionLevel = 0;
var stage1 = [397,473];
var stage2 = [230,1456];
var stage3 = [495,2104];
var stage4 = [600,1350];
var stage5 = [1080,423];
var stage6 = [1340,805];
var stage7 = [1024,1387];
var stage8 = [1322,2089];
var stage9 = [2200,2098];
var stage10 = [2894,1990];
var stage11 = [2878,1300];
var stage12 = [2767,401];
var stage13 = [1927,342];
var stage14 = [2033,1327];
var keyLocations = [];
var q1=[], res1=[], ls1=[];
var q2=[], res2=[], ls2=[];
var chestQuestions = [];
$.ajax({
		url:'includes/modal.php',
		method:'post',
		data:{fetch:'fetch'},
		method:'post',
		dataType:'json',
		success:function(dt){
			$(dt).each(function(v,i){
				console.log(i.level);
				if(i.level == 1){
					q1.push(i.question);
					res1.push(i.answer);
					ls1.push(i.level);
				} else {
					q2.push(i.question);
					res2.push(i.answer);
					ls2.push(i.level);
				}
				if(i.level == 0){
					var tmp  = [];
					tmp.push(i.question);
					tmp.push(i.answer);
					tmp.push(i.level);
					chestQuestions.push(tmp);
				}
			});
		}
	});
//res = [2,2.4,2,12,0,10,28,0,1,6,7,4.4,2,8,9]; //answers
//ls = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]; //levels
console.log(chestQuestions);
var masterChestQuestions = [];



