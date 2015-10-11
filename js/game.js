// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// canvas.width = 1124;
// canvas.height = 929;

document.body.appendChild(canvas);

//-------- Images



// Background image

var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.jpg";


//Scale Size
var scale = {

	//for pos
	prevW: window.innerWidth,
	prevH: window.innerHeight,
	x: 0,
	y: 0,
	
	//image width and height
	w: window.innerWidth/bgImage.width,
	h: window.innerHeight/bgImage.height,

	update: function() {
		this.w = window.innerWidth/bgImage.width;
		this.h = window.innerHeight/bgImage.height;

		this.x = window.innerWidth/this.prevW;
		this.y = window.innerHeight/this.prevH;

		this.prevW = window.innerWidth;
		this.prevH = window.innerHeight;
	}
}


// node images
var nodesReady_lck = false;
var nodesReady_unlck = false;

var nodeImage_lck = new Image();
var nodeImage_unlck = new Image();

nodeImage_lck.onload = function () {
	nodesReady_lck = true;
};
nodeImage_unlck.onload = function () {
	nodesReady_unlck = true;
};
nodeImage_lck.src = "images/node_lck.jpg";
nodeImage_unlck.src = "images/node_unlck.jpg";

nodeWidth = nodeImage_lck.width*scale.w;
nodeHeight = nodeImage_lck.height*scale.h;


//Menu Object
var menu = {
	pauseResume: function() {
		if (game.play){
			//game is playing pause
			game.pause();
			var x = document.getElementById("menuPause");
			x.innerHTML = "Resume";
		} else {
			//resume play
			game.resume();
			var x = document.getElementById("menuPause");
			x.innerHTML = "Pause";
		}

	},

	restart: function(){
		confirmBox("Do you want to Restart the game?", init);
	},

	quit: function() {
		confirmBox("Are you sure you wish to Quit the game?", game.end);
	}
}

// Game objects
var difficulty = {
	level: "Easy",

	numAttempts: function(){
		if (this.level == "Easy") {
			return 3;
		} else if (this.level == "Med") {
			return 2;
		} else {
			return 1;
		}
	},

	timeOut: function() {
		//returns timeout of difficulty level
		if(this.level == "Easy") {
			return 600000;	//10 mins
		} else if(this.level == "Med") {
			return 300000;	//5mins in ms
		} else {
			//hard
			return 120000;	//2mins
		}
	}
}

var game = {
	started: false,
	play: false,	//ability to play
	audio: new Sound("audio/pokemon1"),

	init: function() {
		time.init();
		score.init();

		//Start Player at a Node / random place on a path
		player.x = canvas.width / 2;
		player.y = canvas.height / 2;

		render();

		settings.open();

	},

	start: function() {
		this.started = true;
		this.play = true;
		time.start();

		this.audio.play();
	
	},

	pause: function() {
		this.play = false;

		//pause timer
		time.pause();
		//Sound
		this.audio.pause();
	},

	resume: function() {
		this.play = true;

		//restart timer
		time.resume();

		//SOund
		this.audio.play();
	},

	mini_pause: function () {
		//Use to pause when mini game pops up
		this.play = false;

		this.audio.pause();

	},

	mini_resume: function() {
		this.play = true;
		this.audio.play();
	},

	end: function(){
		//end the game
		alert("GAME OVER - COMPLETED");
		displayLeader();
	}
}

function Sound(src) {
	//Note src is without file extension and must have a .mp3 and .ogg in same dir
	this.ON = true;

	this.s = document.createElement("AUDIO");

	if (this.s.canPlayType("audio/mpeg")) {

		this.s.setAttribute("src", src+".mp3");
	} else {
		this.s.setAttribute("src", src+".ogg");
	}
	this.s.loop = true;
	document.body.appendChild(this.s);

	//set some attributes
	this.s.loop = true;

	this.play = function(){
		if(this.ON){
			this.s.play();
		}
	}

	this.pause = function() {
		this.s.pause();
	}

	//also updates settings and displaying functions
	this.btn = document.getElementById("soundBtn")

	this.setON = function(){
		this.ON = true;
		this.play();
		this.btn.innerHTML = "SOUND: ON";
	}
	this.setOFF = function(){
		this.ON = false;
		this.pause();
		this.btn.innerHTML = "SOUND: OFF";


	}

	this.toggle = function() {
		//toggles between on and off (for sound button and settings)
		
		if (this.s.paused) {
			this.setON();
		} else {
			this.setOFF();
		}
	}
}

var time = {
	then: 0, 
	now: 0,
	curr: 0,

	paused: true,

	init: function(){
		this.curr = 0;
		this.paused = true;
	},

	start: function () {
		this.curr = 0;
		this.then = Date.now();
		this.paused = false;
	}, 
	pause: function() {
		this.paused = true;
	}, 
	resume:function(){
		this.then = Date.now();
		this.paused = false;

	},
	update: function(){
		
		if(!this.paused) {
			this.now = Date.now();
			this.curr += this.now - this.then;

			this.then = this.now;	
		};

		return this.curr;
	},

	get: function(){

		//convert to MM:SS
		return msToTime(this.update());
	}
}

//Convert milliseconds to MM:SS:mm
function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)

    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return minutes + ":" + seconds + "." + milliseconds;
}


//sprite for player and movements
function Sprite(imSrc, numFrames) {
	
	//sprite sheet
	this.ready = false;
	this.img = new Image();
	this.imgLoad = function() {
		this.ready = true;
	}
	this.img.onload = this.imgLoad();
	
	
	this.img.src = imSrc;
		
	this.numFrames = numFrames;	//per direction
	this.w = this.img.width/numFrames;	//width of sprite (const)
	this.h = this.img.height/4;	//height of sprite (const)
	
	//Start sprite facing downwards
	this.dir = "down"; 
	this.x = 0;
	this.y = 0;
	
	//step iterator - only update sprite evry nSteps
	this.nSteps = 5;
	this.itSteps = 0;	//initialise iterator
		
	//Sprite sheet to be set up  with rows in order below (from top to bottom)
	this.down = function(){
		//Move Down
		if(this.dir == "down") {
			this.next();
		} else {
			//start moving down 
			this.x = 0;
			this.y = 0;
			this.dir = "down";

			this.itSteps = 0; //initiate number of steps
		}
	};
	
	this.left = function() {
		//Move Left
		if(this.dir == "left") {
			this.next();
		} else {
			//start moving left 
			this.x = 0;
			this.y = this.h;
			this.dir = "left";

			this.itSteps = 0; //initiate number of steps
		}
	};
	
	this.right = function() {
		//Move Right
		if(this.dir == "right") {
			this.next();
		} else {
			//start moving right 
			this.x = 0;
			this.y = 2*this.h;
			this.dir = "right";

			this.itSteps = 0; //initiate number of steps
		}
	};
	
	this.up = function(){
		//Move up 
		if(this.dir == "up") {
			this.next();
		} else {
			//start moving up 
			this.x = 0;
			this.y = 3*this.h;
			this.dir = "up";

			this.itSteps = 0; //initiate number of steps
		}
	};
	
	this.next = function(){ 
		//incremeent number of steps & change sprite if theres enough
		

		if(++this.itSteps > this.nSteps) {

			//increment frame in same direction
			this.x += this.w;
			if(this.x >= this.img.width) {this.x = 0}; // return to starting sprite	

			//restart step count
			this.itSteps = 0;
		}
	};
	
}

var Characters = new function() {

	this.numSprites = 3;

	//display image of sprites
	this.imgs = new Array(this.numSprites);

	for(i = 0; i < this.numSprites; i++){

		this.imgs[i] = new Image();
		this.imgs[i].src = "images/player"+i+"_lrg.png";
	}

}




var player = {
	
	//sprite images
	sprite: {}, //new Sprite("images/player0_sprite.png", 4),
	
	speed: 150, // movement in pixels per second
		
	//Absolute values in canvas
	x: 0,
	y: 0,

	w: 0,
	h: 0,

	init: function(charIdx){
		//char is the idx sprite we will be using
		this.sprite = new Sprite("images/player"+charIdx+"_sprite.png",4);
		this.w = this.sprite.w*scale.w;
		this.h = this.sprite.h*scale.h;


	},


	move: function(modifier){
		modifier *= this.speed;

		//move player if keypad input
		if (38 in keysDown) { // Player holding up
			this.y -= modifier;
			if (this.y < 0) {this.y = 0};	//check bdry
			
			player.sprite.up();	//update sprite
		}
		if (40 in keysDown) { // Player holding down
			this.y += modifier;
			if (this.y > window.innerHeight - this.h) {this.y = window.innerHeight - this.h}; //check bdry
			
			player.sprite.down(); //update sprite
		}
		if (37 in keysDown) { // Player holding left
			this.x -= modifier;
			if(this.x < 0) {this.x = 0}; 
			
			player.sprite.left(); //update sprite
		}
		if (39 in keysDown) { // Player holding right
			this.x += modifier;
			if(this.x > window.innerWidth - this.w) {this.x = window.innerWidth - this.w}; //check bdry
			
			player.sprite.right(); //update sprite
		}

	},

	moveOff: function(fwd) {													//implement this by takig back to previous node
		//Move play off node
		dir = player.sprite.dir;


		if (fwd) {
			//move off in same direction as the player reached the node
			// ie unlocked node
			player.mvByDir(dir);


		} else {
			//move off backwards (ie incorrect)
			player.mvByDir(player.oppositeDir(dir));

		}


	},
	
	mvByDir: function(dir, modifier) {
		//NOTE not checking - function only to be used when player will not exceed bdrys
		dist = nodeWidth;

		if (dir == "up") { 
			this.y -= dist;
		}
		if (dir == "down") { 
			this.y += dist;
		}
		if (dir == "left") { 
			this.x -= dist;
		}
		if (dir == "right") { 
			this.x += dist;
		}
	},

	oppositeDir: function(dir) {
		if(dir == "up") return "down";
		if(dir == "down") return "up";
		if(dir == "left") return "right";
		if(dir == "right") return "left";

	}
};

var numUnlcked = 0;	//number of unlocked nodes

function Node (name, x, y) {
	this.name = name;
	this.x = x; 
	this.y = y;



	this.locked = true;
	this.unlock = function() {
		this.locked = false;
		//change the image too

		//update number of unlocked
		++numUnlcked;
	}
};

var nodes = [
	new Node("QLD_sth", 975 * scale.w, 350 * scale.h),
	new Node("QLD_nth", 860  * scale.w, 150 * scale.h),
	new Node("NSW", 900 * scale.w, 550 * scale.h),
	new Node("ACT", 970 * scale.w, 610 * scale.h),
	new Node("VIC", 800 * scale.w, 720 * scale.h),
	new Node("TAS", 850 * scale.w, 860 * scale.h),
	new Node("SA", 510 * scale.w, 500 * scale.h),
	new Node("WA", 150 * scale.w, 500 * scale.h),
	new Node("NT", 560 * scale.w, 250 * scale.h),
	];


var scaleNodes = function() {

	for (i = 0; i < nodes.length; i++) {
		nodes[i].x *= scale.x;
		nodes[i].y *= scale.y;
	}
}		

var score = {
	curr: 0,
	mult: 0,	//multiplier
	add: 10,	//adding score
	sub: -5,	//subtract for question wrong

	init: function() {
		this.curr = 0;
		this.mult = 0;
	},

	increase: function() {
		//Increase the score if a node has been passed
		++this.mult;
		this.curr += this.add*this.mult;
	},

	decrease: function() {
		//decrease score if a node was wrongly answered
		this.mult = 0;

		this.curr += this.sub;
		if(this.curr < 0) {
			this.curr = 0;
		}
	}
}


//returns if the player has reached a node
var isAtNode = function() {
	w = (player.w) / 2;
	h = (player.h) / 2;


	for (i = 0; i < nodes.length; i++) {
		if (player.x <= (nodes[i].x + w) && nodes[i].x <= (player.x + w)
			&& player.y <= (nodes[i].y + h) && nodes[i].y <= (player.y + h)) 	{
			
			return {
				bool: true,
				idx: i,
			}
		}
	}

	return false;
}

//Handle Window resize
window.addEventListener("resize", function () {
	//resize canvas 
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	//resize images
	scale.update();

	player.w = playerImage.width*scale.w;
	player.h = playerImage.height*scale.h;

	//update player posistion 
	player.x *= scale.x;
	player.y *= scale.y;

	nodeWidth = nodeImage_lck.width*scale.w;
	nodeHeight = nodeImage_lck.height*scale.h;

	//scale Nodes
	scaleNodes();
});


// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);


addEventListener("keydown", function (e) { hotKey(e.keyCode)});

//check if ahotkey ha been used
var hotKey = function(keyCode){
	
	switch(keyCode) {
		case 32:
			//space bar - pause/resume
			menu.pauseResume();
			break;
		case 81:
			//'q' - quit game
			menu.quit();
			break;
		case 83:
			//'s' - toggle sound
			game.audio.toggle();

			break;
		case 73:
			//'i' - display instructrions
			displayInstructs();
			break;
		case 82:
			//'r' - restart
			menu.restart();
			break;
	}
}


// Update game objects
var play = function (modifier) {

	//move from keypad input
	if (game.play) {
		
		player.move(modifier);


		//check if we have reached a node
		check = isAtNode();

		if(check) {
			// at a node
			if (nodes[check.idx].locked) {
				//locked node 
				playMini(nodes[check.idx].name);
			} else {
				//unlocked node - display info
				displayTrove();
			}

		}

		
		//check if game over
		if (numUnlcked == nodes.length || time.update() > difficulty.timeOut()) {
			//game over
			game.end();
		}
	}
};

//Updates Score and nodes depending on how user performed on minigame
var update = function(correct, attemptsLeft) {

	if(correct) {

		nodes[check.idx].unlock(); //note nodes should be locked before doing this

		score.increase();

		//moveOff node
		player.moveOff(true);


	} else {
		//incorrect 
		score.decrease();

		if(attemptsLeft <= 0) {
			//move off node
			player.moveOff(false);
		}
	}
}

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0, window.innerWidth, window.innerHeight);
	}

	if (nodesReady_lck && nodesReady_unlck) {
		for(i = 0; i < nodes.length ; i ++) {
			if (nodes[i].locked) {
				//draw locked image
				ctx.drawImage(nodeImage_lck, nodes[i].x, nodes[i].y, nodeWidth, nodeHeight);
			} else {
				//draw unlocked image
				ctx.drawImage(nodeImage_unlck, nodes[i].x, nodes[i].y, nodeWidth, nodeHeight);
			}		
		}
		
	}
	
	
	if (player.sprite.ready) {
		ctx.drawImage(player.sprite.img,  player.sprite.x, player.sprite.y, player.sprite.w, player.sprite.h, player.x, player.y, player.w, player.h);
	}

	// Score
	ctx.fillStyle = "rgb(5, 5, 5)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + score.curr + " Time: " + time.get(), 32, 32);
};


// init the game when the player catches a node
var init = function () {

	//Start Player at a Node / random place on a path
	player.x = canvas.width / 2;
	player.y = canvas.height / 2;

	game.start();

};


// The main game loop
var main = function () {

	
	var now = Date.now();
	var delta = now - then;

	play(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
	
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
game.init();
main();
