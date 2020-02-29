function GenRocket(x, y, givenDna, winner) {
	this.x = x;
	this.y = y;
	this.angle = Math.PI/2;
	this.xVel = 0;
	this.yVel = 0;
	this.angVel = 0;
	this.fireing = true;
	this.landed = false;
	this.landedOnPad = false;
	//this.maxAlt = height;
	if(givenDna)
		this.dna = givenDna;
	else
		this.dna = new Dna();
	this.flightDone = false;
	if(winner)
		this.winner = winner;
	else
		this.winner = false;
	this.crashed = false;

	let accel = 15/60;   // (15m/s) / (60fps)
	let rWidth = 6;
	let rHeight = 50;
	let lowestHeight;
	let instruction;
	let landSpot = 0;

	this.update = function() {
		if(count % 10 == 0)   //new instruction is performed 10 times per second
		{
			instruction = count/10;
			if(this.dna.genes[instruction] == 1)        //1 for starting engine
				this.fireing = true;
			else if(this.dna.genes[instruction] == 2)   //2 for cutting off engine
				this.fireing = false;
			else if(this.dna.genes[instruction] == 3 && this.angVel != 0.5)  //3 for turning ccw
				this.angVel += 0.5;
			else if(this.dna.genes[instruction] == 4 && this.angVel != -0.5) //4 for turning cw
				this.angVel -= 0.5;
		}												//0 does nothing
		if(!this.landed) {
			if(this.fireing) {   //accelerate rocket in direction it's facing
				this.xVel += accel * Math.cos(this.angle);
				this.yVel += accel * Math.sin(this.angle);
			}
			this.yVel -= 9.8/60;        //acceleration due to gravity
			this.x += this.xVel/60;     //move x position by x velocity
			this.y += this.yVel/60;		//move y position by y velocity
			this.angle += this.angVel/60;	//change angle by angular velocity

			if(this.y < this.maxHeight)
				this.maxHeight = this.y;
			if(this.angle > 2*Math.PI)    //normalize angle
				this.angle -= 2*Math.PI
			else if(this.angle < 0)
				this.angle += 2*Math.PI;

			if(Math.abs(Math.PI/2 - this.angle) < 0.2)  //if angle if less than 0.2 dont take into acount angle for lowest height. stop rockets from crashing when taking off while turning
				lowestHeight = this.y + rHeight/2 - Math.abs(Math.sin(this.angle)*rHeight/2);
			else  //find height lowest point of the rocket
				lowestHeight = this.y + rHeight/2 - Math.abs(Math.sin(this.angle)*rHeight/2) - Math.abs(Math.cos(this.angle)*rWidth/2)
			if(lowestHeight <= 0)  //rocket is touching the ground
	    	{
	    		this.y = Math.abs(Math.sin(this.angle)*rHeight/2) + Math.abs(Math.cos(this.angle)*rWidth/2) - rHeight/2;  //set rockets height to touching the ground at lowest point
	   			if((this.yVel**2 + this.xVel**2)**0.5>10 || Math.abs(this.angle - Math.PI/2) > 0.1) //rocket is moving too fast (> 10 m/s) or angle is too high
	    		{
					//console.log('Crashed ' + (this.yVel**2 + this.xVel**2)**0.5 + ' m/s');
					this.flightDone = true;
					this.crashed = true;
				}
				else  //rocket has landed
				{
					this.flightDone = true;
					this.landed = true;
					if(Math.abs(this.x - l1.x) < 12)  //rocket has landed on pad
					{
						console.log('Landed on pad ' + (this.yVel**2 + this.xVel**2)**0.5 + ' m/s');
						this.landedOnPad = true;
						if(!successLanding)
							console.log(new Date() - time + " ms");
						successLanding = true;
					}
					// else
					// 	console.log('Landed on ground ' + (this.yVel**2 + this.xVel**2)**0.5 + ' m/s');
				}
			}
		}
	}

	this.show = function() {  //draw rocket
		translate(this.x, height*0.8 - this.y - rHeight/2);
		rotate(Math.PI/2-this.angle);
		//rect(this.x - rWidth/2, height*0.8 - this.y-rHeight, rWidth, rHeight);
		if(this.winner) {  //winner has no opacity
			if(this.fireing)  //if rocket is fireing make it red
				fill(200, 0, 0);
			else
				fill(235);
		}	
		else {
			if(this.fireing)
				fill(200, 0, 0, 150);
			else
				fill(235, 150);
		}
		rect(-rWidth/2, -rHeight/2, rWidth, rHeight);
		triangle(-rWidth/2, -rHeight/2, 0, -rHeight/2-5, rWidth/2, -rHeight/2);
		rotate(-(Math.PI/2-this.angle));
		translate(-this.x, -(height*0.8 - this.y - rHeight/2));
	}

	this.calcScore = function() {  //calculate score after generation is complete
		let score = 100000000;
		if(gen < 37)			   //encourages rockets to fly past the landing pad for the first sevral
			landSpot = 150-gen;//*4;  //generations which causes them to slow down to land slower in later generations
		else
			landSpot = 0;
		let dist = Math.abs(l1.x + landSpot - this.x + Math.cos(this.angle)*rHeight/2)**2; //distance landed from pad
		if(dist <= 144)  //rocket made it to pad
			score /= 70;
		else
			score /= dist;
		score *= map(Math.abs(Math.PI/2 - this.angle), 0, Math.PI**2, 1, 0.5);   //landing angle 
		score *= map((this.xVel**2 + this.yVel**2)**0.5, 0, 100, 1, 0.4, true);	 //landing velocity
		if(!this.flightDone)   //if rocket didn't land in time
			score*=0.2;
		if(this.landedOnPad)
			score*=5;
		if(dist**0.5 >= width*0.5 + landSpot - 1) // if rocket stayed still or went left
			score /= 5;
		score /= count**4;
		// if(this.maxHeight > height*0.2)
		// 	score *= 1/this.maxHeight**3;
		// else
		// 	score *= 1/height**3;
		return score;
	}
}



function LandingPad(x, c) {  //create landing pad
	this.x = x;
	this.col = c;

	this.show = function() {
		fill(this.col);
		rect(this.x-15, height*0.8-1, 30, 4);
	}
}




