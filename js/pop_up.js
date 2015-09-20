function toggle(div_id) {
	var el = document.getElementById(div_id);
	if ( el.style.display == 'none' ) {	el.style.display = 'block';}
	else {el.style.display = 'none';}
}

function blanket_size(popUpDivVar) {
	if (typeof window.innerWidth != 'undefined') {
		viewportheight = window.innerHeight;
	} else {
		viewportheight = document.documentElement.clientHeight;
	}
	if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
		blanket_height = viewportheight;
	} else {
		if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
			blanket_height = document.body.parentNode.clientHeight;
		} else {
			blanket_height = document.body.parentNode.scrollHeight;
		}
	}
	var blanket = document.getElementById('blanket');
	blanket.style.height = blanket_height + 'px';
	var popUpDiv = document.getElementById(popUpDivVar);
	popUpDiv_height=blanket_height/2-200;//200 is half popup's height
	popUpDiv.style.top = popUpDiv_height + 'px';
}

function window_pos(popUpDivVar) {
	if (typeof window.innerWidth != 'undefined') {
		viewportwidth = window.innerHeight;
	} else {
		viewportwidth = document.documentElement.clientHeight;
	}
	if ((viewportwidth > document.body.parentNode.scrollWidth) && (viewportwidth > document.body.parentNode.clientWidth)) {
		window_width = viewportwidth;
	} else {
		if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
			window_width = document.body.parentNode.clientWidth;
		} else {
			window_width = document.body.parentNode.scrollWidth;
		}
	}
	var popUpDiv = document.getElementById(popUpDivVar);
	window_width=window_width/2-200;//200 is half popup's width
	popUpDiv.style.left = window_width + 'px';
}

function popup(windowname) {
	blanket_size(windowname);
	window_pos(windowname);
	toggle('blanket');
	toggle(windowname);		
}

//custom confirmBox
function confirmBox(str, confirmFunc){
	var win = "confirmDiv";

	game.pause();
	//open dialog
	popup(win);
	document.getElementById("info").innerHTML = str;

	document.getElementById("yes").onclick = function(){
		
		confirmFunc();
			
		//close
		popup(win);
	};

	document.getElementById("cancel").onclick = function(){
		game.resume();
		
		//close
		popup(win);
	};
}




////////////////////////////////////////////////////////
//					MINI GAME
////////////////////////////////////////////////////////
function playMini(name) {
	//play mini game for 'name' region
	game.pause();

	popup("miniGameDiv");

	document.getElementById("location").innerHTML = name;
}


//Answer to the mini game has been submitted
function submitAns(ans) {
	//Check if it is correct or not
	if(!isOneChecked("q")) {
		// No answer submitted
		alert("Please choose an answer.");

		return;

	} 
	correct = false;

	if (document.getElementById(ans).checked) {
		//correct
		correct = true;
	} 

	//display some trove stuff
	displayTrove(correct, ans);

	//update game specs
	update(correct);

	//close miniGame
	popup("miniGameDiv");
	
}


function isOneChecked ( name ) {
	//returns wheter at least one  check box is checked 

    var checkboxes = document.getElementsByName( name ),
        i = checkboxes.length - 1;

    for ( ; i > -1 ; i-- ) {

        if ( checkboxes[i].checked ) { return true; }

    }

    return false;
}


function hint() {
	//display a hint
	alert("Will Display A Hint here - NOT YET IMPLEMENTED");
}







///////////////////////////////////////////////////////
// ----------------- MINI GAME ------------------------
///////////////////////////////////////////////////////
////////////////////////////////////////////////////////
//					TROVE INFO
////////////////////////////////////////////////////////
function displayTrove(correct, ans) {

	//display some trove data
	popup("troveInfoDiv");

	if (correct) {
		//correct
		document.getElementById("qCorrect").innerHTML = "Correct";	
	} else {
		//incorrect
		document.getElementById("qCorrect").innerHTML = "Incorrect" + "<br />" + "the correct answer was " + ans;	
	}
	

}

function closeTrove() {

	//close popup
	popup("troveInfoDiv");

	//resume game 
	game.resume();
}







///////////////////////////////////////////////////////
// ----------------- TROVE INFO ------------------------
///////////////////////////////////////////////////////
////////////////////////////////////////////////////////
//					INSTRUCTIONS
////////////////////////////////////////////////////////

function displayInstructs(){
	//display instructions
	game.pause();
	popup("instructionsDiv");

}
function closeInstructs(){
	popup("instructionsDiv");
	if(game.started) {
		game.resume();	
	}
}





///////////////////////////////////////////////////////
// ----------------- INSTRUCTIONS----------------------
///////////////////////////////////////////////////////

////////////////////////////////////////////////////////
//					INITIAL SETTINGS
////////////////////////////////////////////////////////
// var chars = new SpriteDisps(3);

var settings = new function() {

	this.win = "initGameDiv";
	this.cIdx = 0;	//character index

	this.open =  function() {
		//open pop up
		popup(this.win);

		//initialise character image
		this.change();
	}
		

	// init the game when the player catches a node
	this.play =function() {
		//close settings window
		popup(this.win);

		//update values according to settings
		player.init(this.cIdx);
		difficulty.level = this.selected("difficulty");

		//sound
		if(this.selected("soundON") == "on") {
			game.audio.setON();
		} else {
			game.audio.setOFF();
		}

		game.start();
	}

	//---------character choices
	this.prev = function() {
		//decrease cIdx
		if(--this.cIdx < 0) {
			this.cIdx = Characters.numSprites-1;
		}

		//change image
		this.change();

	}

	this.next= function(){
		if(++this.cIdx > Characters.numSprites-1) {
			this.cIdx = 0;
		}
		//change idx
		this.change();

	}

	this.change = function(){
		document.getElementById("character").src = Characters.imgs[this.cIdx].src;
	}

	//-----------Radio Buttons
	this.selected = function(name){
		var btns = document.getElementsByName(name);
		for(i=0; i < btns.length; i++) {
			if(btns[i].checked){
				return btns[i].id;
			}
		}
	}
}



///////////////////////////////////////////////////////
// --------------- INITIAL SETTINGS--------------------
///////////////////////////////////////////////////////