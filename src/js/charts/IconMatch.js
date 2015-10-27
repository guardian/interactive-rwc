import Match from './Match';
export default class IconMatch extends Match {

	_mergeEvents() {
		let self=this;
		console.log(this.teams)

		let last_score={};



		

		this.events.forEach(function(d){
			
			if(!last_score[d.team_id]) {
				last_score[d.team_id]=0;
			}
			if(!last_score[self.other_team[d.team_id]]) {
				last_score[self.other_team[d.team_id]]=0;
			}
			last_score[d.team_id]=d.score;
			d.other_score=last_score[self.other_team[d.team_id]]
		})

		console.log("EVENTS",this.events)
	}

	_buildChart() {
		let self=this;
		let timeline=null;

		this.options.indexed=true;
		this.options.relative_height=true;

		this.margins={
			top:30,
			left:30,
			bottom:30,
			right:58
		}

		let svg=this.container
						.classed("icon",true)
						.append("svg")

		let box=svg.node().getBoundingClientRect();
		let WIDTH = box.width,
			HEIGHT= box.height;
		

		this.xscale=d3.scale.linear().domain(this.extents.seconds).range([0,WIDTH-(this.margins.left+this.margins.right)])
		this.yscale=d3.scale.linear().domain([0,this.max_score || this.extents.score]).range([HEIGHT-(this.margins.top+this.margins.bottom),0])

		if(this.options.indexed){
			this.xscale.domain(this.extents.score_indexes)	
		}
		if(this.options.relative_height) {
			this.yscale.domain([0,this.extents.score[1]])
		}
		
		
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
		this.other_team={};
		this.other_team[this.teams[0].id]=this.teams[1].id;
		this.other_team[this.teams[1].id]=this.teams[0].id;

		this._mergeEvents();

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
							
		/*team.append("path")
				.attr("d",function(d){
					return area(d.values.events
						.filter(function(d){
							return 	d.type==="first half start"
									||
									d.type==="second half end"
									||
									d.type==="try"
									||
									d.type=="penalty try"
									||
									d.type=="conversion"
									||
									d.type=="penalty"
									||
									d.type=="drop goal";
						})
						.map(function(v){
						//console.log(v.seconds,v.score)
						return {
							x:v.seconds,
							y:v.score
						}
					}))
				})*/


		/*team.append("circle")
				.attr("cx",function(d){
					return self.xscale(self.xscale.domain()[1])
				})
				.attr("cy",function(d){
					return self.yscale(d.values.score)
				})
				.attr("r",this.options.small?1.5:3)*/
		team.append("text")
				.attr("class","team-name")
				.attr("x",function(d){
					return self.xscale(self.xscale.domain()[1])
				})
				.attr("dx",12)
				.attr("y",function(d){
					return self.yscale(d.values.score);
				})
				.attr("dy",function(d){
					//console.log(d.key,d,self.extents.score[1])
					if(d.values.score<self.extents.score[1]) {
						return 17;
					}
					return -8;
				})
				.text(function(d){
					return self.teams_info[d.key]["short_name"] + " " +d.values.score;
				})

		var status=team.selectAll("g.status")
				.data(function(d){
					console.log("!!!!!!",d)
					return d.values.events.filter(function(d){
						return 	d.type==="try"
								||
								d.type=="penalty try"
								||
								d.type=="conversion"
								||
								d.type=="penalty"
								||
								d.type=="drop goal";
					});
				})
				.enter()
				.append("g")
					.attr("class","status")
					.attr("transform",function(d,i){
						//console.log("INDEX",d.index,"(",i,")");
						var x=self.xscale(self.options.indexed?d.score_index:d.seconds),
							y=0;
						return "translate("+x+","+y+")"
					})

		status.append("line")
				.attr("x1",0)
				.attr("y1",function(d){
					return self.yscale(d.score)
				})
				.attr("x2",0)
				.attr("y2",function(d){
					return self.yscale(d.other_score)
				})
		status.append("circle")
				.attr("cx",function(d){
					return 0;
				})
				.attr("cy",function(d){
					return self.yscale(d.score)
				})
				.attr("r",12)
		status.append("use")
				.attr("class",function(d){
					return d.type.replace(/\s/gi,"-")+"-icon"
				})
				.attr("xlink:href",function(d){
					return "#"+d.type.replace(/\s/gi,"-");
				})
				.attr("x",function(d){
					return 0;
				})
				.attr("y",function(d){
					return self.yscale(d.score);
				})

		status.append("circle")
				.attr("class",function(d){
					return "other-team "+self.teams_info[self.other_team[d.team_id]].nid;
				})
				.attr("cx",function(d){
					return 0;
				})
				.attr("cy",function(d){
					return self.yscale(d.other_score)
				})
				.attr("r",3)
		

		let axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+this.margins.left+","+this.margins.top+")")

		/*let xAxis = d3.svg.axis()
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
			      .call(xAxis);*/

		/*if(this.timeline) {
			timeline=new Timeline(nested_data,{
				xscale:this.xscale,
				container:this.container,
				margins:this.margins,
				teams_info:this.teams_info,
				country_field:this.options.country_field
			});
		}*/
	}

}