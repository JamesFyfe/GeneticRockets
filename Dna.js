function Dna(givenGenes) {
	let numGenes = maxTime*10-1;
	if(givenGenes)
		this.genes = givenGenes;
	else
	{
		this.genes = [];
		for(let i=0; i<numGenes; i++)  //creates random set of genes
		{
			this.genes[i] = floor(random(5)); //0 nothing, 1 fire, 2 stop fire, 3 +0.5 ccw, 4 -0.5 cw
		}
	}

	this.crossOver = function(other) {  //splits genes from 2 parents to child
		let childDna = [];
		let split = random(genTime*0.1);  //random split point within last generations total time
		for(let i=0; i<numGenes; i++)
		{
			if(i < split)
				childDna[i] = this.genes[i];
			else
				childDna[i] = other.genes[i];
		}
		return new Dna(childDna);
	}

	this.mutate = function() {    //randomly mutate some genes
		let mutationRate = 0.008;  
		for(let i=0; i<this.genes.length; i++)   
		{												
			mutationRate += 0.02/numGenes;	//mutation rate grows over time for more randomness towards end of flight		
			let n = random();
			if(n < mutationRate)
				this.genes[i] = floor(random(5));
		}
	}
}
let play = true;
let l1, r1;
let rockets = [], numRockets = 100;
let rScore, genePool, maxScore, maxScoreIndex, genTime, numChanges = 0;
let count = 0, gen = 1;
let genText, countText, speedText;
let maxTime = 20, speed = maxTime*100;
let winnerPOV = true, drawNone = true, successLanding = false, playerRocket = false;
let time = new Date();
let rocketPos = 0.2;

function setup() {
	createCanvas(window.screen.availWidth-(window.outerWidth-window.innerWidth), window.screen.availHeight-(window.outerHeight-window.innerHeight));
	frameRate(60);
	Pbutton = createButton('Play/Pause');
	Pbutton.position(10, 75);
	Pbutton.mousePressed(playPause);

	winnerButton = createButton('Only winner');
	winnerButton.position(10, 105);
	winnerButton.mousePressed(changePOV);

	winnerButton = createButton('Draw none');
	winnerButton.position(100, 105);
	winnerButton.mousePressed(TDrawNone);

	Speedbutton = createButton('Speed Up');
	Speedbutton.position(10, 135);
	Speedbutton.mousePressed(function() {setSpeed(speed+1);});

	SlowButton = createButton('Slow Down');
	SlowButton.position(10, 165);
	SlowButton.mousePressed(function() {setSpeed(speed-1);});

	Speed1Button = createButton('Speed 2000');
	Speed1Button.position(10, 195);
	Speed1Button.mousePressed(function() {setSpeed(2000);});

	Speed1Button = createButton('Speed 5');
	Speed1Button.position(100, 195);
	Speed1Button.mousePressed(function() {setSpeed(5);});

	genText = document.getElementById("generation");
	genText.innerHTML = "Generation " + gen;
	countText = document.getElementById("count");
	countText.innerHTML = count;
	speedText = document.getElementById("speed");
	speedText.innerHTML = speed;
	createInitRockets();
	l1 = new LandingPad(width*0.8, "white");
	background("#b5d1ff");
	fill("green");
	rect(0, height*0.8, width, height);
	l1.show();
	//showEvolution();          //show all rockets at ten x speed
	createPlayerRocket();     //create player controlled rocket
}

function draw() {
	countText.innerHTML = count;
	if(!drawNone || playerRocket) {
		background("#b5d1ff");
		fill("green");
		rect(0, height*0.8, width, height);  //draw ground
		l1.show();
	}
	
	for(let j=0; j < speed; j++)
	{
		for(r of rockets)
		{
			if(!r.flightDone)
				r.update();     //update rockets position speed ect
		}
		count++;
		if(count >= maxTime*100 || allDone())  //if current gen is done start new gen
		{
			createNewRockets();
			genTime = count;
			count = 0;
			gen++;
			genText.innerHTML = "Generation " + gen;
			if(successLanding) //if a rocket has landed on the pad
			{
				setSpeed(1);
				drawNone = false;
			}
		}
	}
	if(!drawNone) {
		let num;
		if(winnerPOV)    //only draw rocket[0] which is the winner of last gen
			num = 1;
		else
			num = rockets.length;

		for(let i=0; i<num; i++)
		{
			rockets[i].show();
		}
	}
	if(playerRocket)      //update player controlled rocket
	{
		if(!r1.crashed) {
			r1.update();
		} else {
			r1.xVel = 0;
			r1.yVel = 0;
			r1.angVel = 0;
		}
		r1.show();
		if(r1.landedOnPad && !rockets[0].landedOnPad)   //change color of pad if player or computer lands first
			l1.col = "#00ff44";
		else if(r1.crashed)
			l1.col = "#db1818";
		else if(!drawNone && rockets[0].landedOnPad)
			l1.col = "#db1818";
	}
}

function createInitRockets() {    //make starting generation of rockets
	for(let i=0; i < numRockets; i++)
	{
		rockets[i] = new GenRocket(width*rocketPos, 0)
	}
}

function createNewRockets() {    //make new generation of rockets
	genePool = [];
	maxScore = 0;
	//let avgScore = 0;
	for(let i=0; i < numRockets; i++)
	{
		rockets[i].score = rockets[i].calcScore();
		//avgScore += rockets[i].score;
		if(rockets[i].score > maxScore)   //find rocket with highest score
		{
			maxScore = rockets[i].score;
			maxScoreIndex = i;
		}
	}
	//avgScore/=numRockets;
	//console.log(maxScore, gen);
	//console.log(avgScore, gen);

	for(let i=0; i < rockets.length; i++)
	{
		let n = rockets[i].score/maxScore*20;
		for(let k=0; k < n; k++)    //add rocket to gene pool n times based off its relative score
		{
			genePool.push(rockets[i].dna);
		}
	}

	if(maxScoreIndex != 0)  //if new rocket is the better than the last winner
	{
		numChanges++;
		//console.log('Change at ' + gen);
	}
	//console.log(rockets[maxScoreIndex], gen);
	rockets[0] = new GenRocket(width*rocketPos, 0, rockets[maxScoreIndex].dna, true);  //set first rocket to winner of last generation

	for(let i=1; i < numRockets; i++)  //create new children rockets with genes from 2 parents
	{
		let parent1 = random(genePool);
		let parent2 = random(genePool);
		let childDna = parent1.crossOver(parent2);  //mix genes from 2 parents
		childDna.mutate();
		rockets[i] = new GenRocket(width*rocketPos, 0, childDna);
	}
}

function createPlayerRocket() {
	let r1Genes = new Array(maxTime*10-1);
	r1Genes.fill(0);
	let r1Dna = new Dna(r1Genes);   //fill genes with all 0's
	r1 = new GenRocket(width*rocketPos, 0, r1Dna);
	r1.fireing = false;
	playerRocket = true;
}

function allDone() {   //all rockets have crashed or landed
	for(let i = 0; i < rockets.length; i++)
	{
		if(!rockets[i].flightDone)
			return false;
	}
	return true;
}


function playPause() {
	if(play)
	{
		noLoop();
		console.log("Paused");
	}
	else
	{
		loop();
		console.log("Resumed");
	}
	play = !play;
}

function setSpeed(s) {
	speed = s;
	speedText.innerHTML = speed;
}

function changePOV() {   //toggle only winner is drawn
	if(winnerPOV)
		winnerPOV = false;
	else
		winnerPOV = true;
}

function TDrawNone() {   //toggle draw none
	drawNone = !drawNone;
	background("#b5d1ff");
	fill("green");
	rect(0, height*0.8, width, height);
	l1.show();
}

function showEvolution() {   //slow down speed on draw all rockets
	setSpeed(5);
	drawNone = false;
	winnerPOV = false;
}

function keyPressed() {
	//console.log(`${keyCode}`);
	if(playerRocket) {
		if(!r1.crashed) {
			if(keyCode == 32) {
				r1.fireing = true;
				if(r1.landed)
				{
					r1.yVel = 0;
					r1.y = 0.1;
				}
				r1.landed = false;
			}
			if(keyCode == 65 || keyCode == 37) {
				r1.angVel += 0.5;
			}
			if(keyCode == 68 || keyCode == 39) {
				r1.angVel -= 0.5;
			}
		}
	}
}

function keyReleased() {
	//console.log(`${keyCode}`);
	if(playerRocket) {
		if(!r1.crashed) {
			if(keyCode == 32) {
				r1.fireing = false;
			}
			if(keyCode == 65 || keyCode == 37) {
				r1.angVel -= 0.5;
			}
			if(keyCode == 68 || keyCode == 39) {
				r1.angVel += 0.5;
			}
		}
	}
}
