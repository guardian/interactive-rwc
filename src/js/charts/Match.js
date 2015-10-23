import Timeline from './Timeline';
export default class Match {

	constructor(data,options) {

		//console.log("Match")
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

		this._updateData();
		this._updateExtents();
		this._buildChart();


	}

	_updateData() {
		let self=this;
		
		this.teams.forEach(function(t){
			self.teams_info[t.id]=t;
		})

		let current_scores={};
		current_scores[this.teams[0].id]=0;
		current_scores[this.teams[1].id]=0;

		this.events=this.events.map(function(d){
			return d["$"];
		});
		this.events.forEach(function(d){
			d.real_minute = +d.minute;
			if(isNaN(d.real_minute)){
				//console.log("+++++",d.minute)
				d.real_minute=d3.sum(d.minute.split("+"),function(n){return +n;})
			}
			d.real_second = +d.second;
			d.seconds = d.real_minute*60 + d.real_second;
		});
		this.events=this.events.sort(function(a,b){
			return a.seconds - b.seconds;
		})
		this.events.forEach(function(d){
			d.type = d.type.toLowerCase();
			//console.log(d.type)
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
			
		})

		this.teams_info[this.teams[0].id].winner=current_scores[this.teams[0].id]>current_scores[this.teams[1].id];
		this.teams_info[this.teams[1].id].winner=current_scores[this.teams[0].id]<current_scores[this.teams[1].id];

		//console.log(this.events);

	}

	_updateExtents() {

		this.extents={
			score:[0,Math.max(this.info.home_score,this.info.away_score)],
			//seconds:[0,(+this.info.period_minute*60 + +this.info.period_second)]
			seconds:d3.extent(this.events,function(d){return d.seconds}),
			minute:this.events.sort(function(a,b){return a.seconds - b.seconds})[this.events.length-1]
		}

		//console.log(this.extents)
	}

	_buildChart() {
		let self=this;
		let timeline=null;

		let svg=this.container.append("svg")

		let box=svg.node().getBoundingClientRect();
		let WIDTH = box.width,
			HEIGHT= box.height;
		

		this.xscale=d3.scale.linear().domain(this.extents.seconds).range([0,WIDTH-(this.margins.left+this.margins.right)])
		this.yscale=d3.scale.linear().domain([0,this.max_score || this.extents.score]).range([HEIGHT-(this.margins.top+this.margins.bottom),0])

		
					//.attr("height",HEIGHT)
						

		let area = d3.svg.line()
				    .x(function(d) { return self.xscale(d.x); })
				    .y(function(d) { return self.yscale(d.y); })
				    .interpolate("step-after")
		let nested_data=d3.nest()
							.key(function(d){
								return d.team_id
							})
							.rollup(function(leaves){
								var events= leaves.filter(function(d){
												return d.period!="Post Game"
											});
								return  {
										score: d3.max(events.map(function(d){return d.score})),
										events: events
								}
							})
							.entries(this.events);
		//console.log(nested_data)
		let team=svg.append("g")
						.attr("class","teams")
						.attr("transform","translate("+this.margins.left+","+this.margins.top+")")
						.selectAll("g.team")
						.data(nested_data)
						.enter()
						.append("g")
							.attr("class",function(d){
								return "team "+self.teams_info[d.key].nid;
							})
							.classed("winner",function(d){
								return self.teams_info[d.key].winner;
							})
							.attr("rel",function(d){
								return d.key;
							})
							
		team.append("path")
				.attr("d",function(d){
					return area(d.values.events.map(function(v){
						//console.log(v.seconds,v.score)
						return {
							x:v.seconds,
							y:v.score
						}
					}))
				})
		/*var evt=team.append("g")
			.attr("class","events")
				.selectAll("g.event")
					.data(function(d){
						return d.values.events.filter(function(e){
							return 	e.type!=="first half start" && 
									e.type!=="first half end" &&
									e.type!=="second half start" && 
									e.type!=="second half end" &&
									e.type!=="end"
						})
					})
					.enter()
					.append("g")
					.attr("class",function(d){
						return "event "+d.type.replace(/\s/gi,"-")
					})
					.attr("data-event",function(d){
						return d.type;
					})
					.attr("transform",function(d){
						//console.log(d)
						var x=self.xscale(d.seconds),
							y=self.yscale(d.score);
						return `translate(${x},${y})`;
					})
		evt
			.filter(function(d){
				return d.type==="yellow card" || d.type==="red card"
			})
			.append("rect")
				.attr("x",-3)
				.attr("y",-12)
				.attr("width",6)
				.attr("height",8)

		evt
			.filter(function(d){
				return d.type!=="yellow card" && d.type!=="red card"
			})
			.append("circle")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",1)*/


		team.append("circle")
				.attr("cx",function(d){
					return self.xscale(self.xscale.domain()[1])
				})
				.attr("cy",function(d){
					return self.yscale(d.values.score)
				})
				.attr("r",this.options.small?1.5:3)
		team.append("text")
				.attr("class","team-name")
				.attr("x",function(d){
					return self.xscale(self.xscale.domain()[1])
				})
				.attr("dx",-5)
				.attr("y",function(d){
					return self.yscale(d.values.score);
				})
				.attr("dy",function(d){
					//console.log(d.key,d,self.extents.score[1])
					if(d.values.score<self.extents.score[1]) {
						return 14;
					}
					return -5;
				})
				.text(function(d){
					return self.teams_info[d.key][self.options.country_field||name] + " " +d.values.score;
				})

		let axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+this.margins.left+","+this.margins.top+")")

		let xAxis = d3.svg.axis()
				    .scale(this.xscale)
				    .orient("bottom")
					.tickValues(function(){

						return d3.range(8).map(function(d){
							return d*10*60;
						}).concat([self.extents.seconds[1]])

					}())
				    .tickFormat(function(d){
				    	return !(d%60)?d/60:self.extents.minute.minute
				    })
				    

		let xaxis=axes.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate("+0+"," + (this.yscale.range()[0]+1) + ")")
			      .call(xAxis);

		if(this.timeline) {
			timeline=new Timeline(nested_data,{
				xscale:this.xscale,
				container:this.container,
				margins:this.margins,
				teams_info:this.teams_info,
				country_field:this.options.country_field
			});
		}
	}

}