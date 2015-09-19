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

nodeWidth = nodeImage_lck.width*scale.w;
nodeHeight = nodeImage_lck.height*scale.h;







// Game objects
var player = {
	speed: 500, // movement in pixels per second
	x: 0,
	y: 0,

	w: playerImage.width*scale.w,
	h: playerImage.height*scale.h,

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

//returns if the player has reached a node
var isAtNode = function() {
	w = (nodeWidth  + player.w) / 2;
	h = (nodeHeight + player.h) / 2;


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

// init the game when the player catches a node
var init = function () {

	//Start Player at a Node / random place on a path
	player.x = canvas.width / 2;
	player.y = canvas.height / 2;

};





// Update game objects
var update = function (modifier) {

	//move from keypad input
	player.move(modifier);

	//check if we have reached a node
	check = isAtNode();

	if(check) {


		popup("popUpDiv");

		document.getElementById("location").innerHTML = nodes[check.idx].name;
		var buttons = document.getElementsByTagName("button");
		var buttonsCount = buttons.length;
		for (var i = 0; i <= buttonsCount; i += 1) {
		    buttons[i].onclick = function(e) {
		        alert(this.id);
		    };
		}

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
		ctx.drawImage(bgImage, 0, 0, window.innerWidth, window.innerHeight);
	}

	if (playerReady) {
		ctx.drawImage(playerImage, player.x, player.y, player.w, player.h);
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

	// Score
	ctx.fillStyle = "rgb(5, 5, 5)";
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
