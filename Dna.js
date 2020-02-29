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