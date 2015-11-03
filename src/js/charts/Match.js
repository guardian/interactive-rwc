//import Timeline from './Timeline';
export default class Match {

	constructor(data,options) {

		//console.log("Match")
		//console.log(options)
		//console.log(data);

		this.options=options;

		this.info=data.RRML["$"];

		this.events=data.RRML.Events[0].Event;

		this.teams=options.teams;
		this.teams_info={};
		this.max_score = options.max_score || 0;
		this.margins=options.margins || {
			top:20,
			bottom:20,
			left:10,
			right:90
		}

		this.container=d3.select(options.container);

		this.timeline=options.timeline;
		this.arrow=options.arrow;

		this._updateData();
		
		this._updateExtents();
		let self=this;
		this._createSVG(function(){
			self._buildChart();
		});

		//this._buildChart();


	}
	_createSVG(callback) {

		let self=this;

		if(this.options.appendChart) {
			this.svg=this.container
				.classed("circle",true)
				.append("div")
					.attr("class","chart")
					.append("svg")
		} else {
			this.svg=this.container
				.classed("circle",true)
				.select("div.chart")
				.append("svg")
		}

		if(callback) {
			let frameRequest = requestAnimationFrame(function checkSVG(time) {

				let box=self.svg.node().getBoundingClientRect();
				
				//console.log(box.width,box.height)

				if(box && (box.width!==300)) {
					//console.log("yep")
	
					self.svg.attr("width",box.width)
					self.svg.attr("height",box.width+10)
					
					callback();
					return;	
				} else {
					frameRequest = requestAnimationFrame(checkSVG);	
				}

			});
		}

	}
	_updateData() {
		let self=this;
		
		this.teams.forEach(function(t){
			self.teams_info[t.id]=t;
		})

		this.other_team={};
		this.other_team[this.teams[0].id]=this.teams[1].id;
		this.other_team[this.teams[1].id]=this.teams[0].id;

		
		this.events=this.events.map(function(d){
			return d["$"];
		});
		this.events.forEach(function(d,i){
			d.real_minute = +d.minute;
			if(isNaN(d.real_minute)){
				////console.log("+++++",d.minute)
				d.real_minute=d3.sum(d.minute.split("+"),function(n){return +n;})
			}
			d.real_second = +d.second;
			d.seconds = d.real_minute*60 + d.real_second;
			
		});
		this.events=this.events.sort(function(a,b){
			return a.seconds - b.seconds;
		})

		

		let current_scores={};
		current_scores[this.teams[0].id]=0;
		current_scores[this.teams[1].id]=0;

		let current_seconds={}
		current_seconds[this.teams[0].id]=0;
		current_seconds[this.teams[1].id]=0;

		

		this.moments=[];

		this.events.forEach(function(d,i){
			
			d.type = d.type.toLowerCase();
			////console.log(d.type)
			if(d.type=="try") {
				current_scores[d.team_id]+=5;
			}
			if(d.type=="penalty try") {
				current_scores[d.team_id]+=5;
			}
			if(d.type=="conversion") {
				current_scores[d.team_id]+=2;
			}
			if(d.type=="penalty") {
				current_scores[d.team_id]+=3;
			}
			if(d.type=="drop goal") {
				current_scores[d.team_id]+=3;
			}
			
			d.score=current_scores[d.team_id];
			d.other_score=current_scores[self.other_team[d.team_id]]
			d.score_index=i;

			let moment={
				team_id:null,
				score:d3.max([current_scores[self.teams[0].id],current_scores[self.teams[1].id]]),
				lower_score:d3.min([current_scores[self.teams[0].id],current_scores[self.teams[1].id]]),
				seconds:d.seconds
			}
			if(current_scores[self.teams[0].id]>current_scores[self.teams[1].id]) {
				moment.team_id=self.teams[0].id
			}
			if(current_scores[self.teams[0].id]<current_scores[self.teams[1].id]) {
				moment.team_id=self.teams[1].id
			}
			self.moments.push(moment)


			
		})

		this.moments=this.moments.filter(function(d){
			return d.score>0;
		})

		////console.log("MOMENTS",this.moments)
		
		this.arcs=[];

		while(this.moments.length>1) {
			let moment=this.moments.pop();
			if(moment.seconds!==this.moments[this.moments.length-1].seconds) {
				let arc={
					team_id:this.moments[this.moments.length-1].team_id,
					seconds:[this.moments[this.moments.length-1].seconds,moment.seconds],
					score:[this.moments[this.moments.length-1].score,moment.score],
					lower_score:[this.moments[this.moments.length-1].lower_score,moment.lower_score],
				}
				this.arcs.push(arc);	
			}
			
		}

		this.arcs.push({
			team_id:null,
			seconds:[0,this.moments[this.moments.length-1].seconds],
			score:[0,this.moments[this.moments.length-1].score],
			lower_score:[0,this.moments[this.moments.length-1].lower_score]
		})

		////console.log("ARCS",this.arcs)

		this.teams_info[this.teams[0].id].winner=current_scores[this.teams[0].id]>current_scores[this.teams[1].id];
		this.teams_info[this.teams[1].id].winner=current_scores[this.teams[0].id]<current_scores[this.teams[1].id];

		
		
		

		

	}

	_updateExtents() {

		this.extents={
			indexes:d3.extent(this.events,function(d){return d.index;}),
			score_indexes:d3.extent(this.events,function(d){return d.score_index;}),

			score:[0,Math.max(this.info.home_score,this.info.away_score)],
			//seconds:[0,(+this.info.period_minute*60 + +this.info.period_second)]
			seconds:d3.extent(this.events,function(d){return d.seconds}),
			minute:this.events.sort(function(a,b){return a.seconds - b.seconds})[this.events.length-1]
		}

		//console.log("EXTENTS",this.extents)
	}

	_buildChart() {
		
	}

}