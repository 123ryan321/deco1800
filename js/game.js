// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
canvas.width = 1124;
canvas.height = 929;

document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
	
};
bgImage.src = "images/background.jpg";



// player image
var playerReady = false;
var playerImage = new Image();
playerImage.onload = function () {
	playerReady = true;
};
playerImage.src = "images/player.png";

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

// Game objects
var player = {
	speed: 500, // movement in pixels per second
	x: 0,
	y: 0,

	move: function(modifier){
		//move player if keypad input
		if (38 in keysDown) { // Player holding up
			this.y -= this.speed * modifier;
		}
		if (40 in keysDown) { // Player holding down
			this.y += this.speed * modifier;
		}
		if (37 in keysDown) { // Player holding left
			this.x -= this.speed * modifier;
		}
		if (39 in keysDown) { // Player holding right
			this.x += this.speed * modifier;
		}

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
	new Node("QLD_sth", 975, 350),
	new Node("QLD_nth", 860, 150),
	new Node("NSW", 900, 550),
	new Node("ACT", 970, 610),
	new Node("VIC", 800, 720),
	new Node("TAS", 850, 860),
	new Node("SA", 510, 500),
	new Node("WA", 150, 500),
	new Node("NT", 560, 250),
	];

var score = {
	curr: 0,
	mult: 0,	//multiplier
	add: 10,	//adding score
	sub: -5,	//subtract for question wrong

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
};

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// init the game when the player catches a node
var init = function () {
	//Start Player at a Node / random place on a path
	player.x = canvas.width / 2;
	player.y = canvas.height / 2;

	// Throw the node somewhere on the screen randomly
	// nodes[0].x = 32 + (Math.random() * (canvas.width - 64));
	// nodes[0].y = 32 + (Math.random() * (canvas.height - 64));
};



//returns if the player has reached a node
var isAtNode = function() {
	w = (nodeImage_lck.width  + playerImage.width) / 2;
	h = (nodeImage_lck.height + playerImage.height) / 2;


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

// Update game objects
var update = function (modifier) {

	//move from keypad input
	player.move(modifier);

	//check if we have reached a node
	check = isAtNode();

	if(check) {


		alert("You Now have to Answer a Question about \n\n" + nodes[check.idx].name);
		popup("popUpDiv");
		//if correct
		if(nodes[check.idx].locked) {
			//locked so unlock it
			nodes[check.idx].unlock();
		}
		score.increase();

		// //if incorrect
		// score.decrease();
		// //move off node 

		init();
	}


	//check if game over
	if (numUnlcked == nodes.length) {
		//game over
		alert("GAME OVER - COMPLETED");
	}
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (playerReady) {
		ctx.drawImage(playerImage, player.x, player.y);
	}


	if (nodesReady_lck && nodesReady_unlck) {
		for(i = 0; i < nodes.length ; i ++) {
			if (nodes[i].locked) {
				//draw locked image
				ctx.drawImage(nodeImage_lck, nodes[i].x, nodes[i].y);
			} else {
				//draw unlocked image
				ctx.drawImage(nodeImage_unlck, nodes[i].x, nodes[i].y);
			}		
		}
		
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + score.curr, 32, 32);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
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
init();
main();
