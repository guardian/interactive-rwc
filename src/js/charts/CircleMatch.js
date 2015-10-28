import Match from './Match';
export default class CircleMatch extends Match {

	
	
	_toRad(deg) {
		let _degreeRadianRatio = 180 / Math.PI;
		return deg / _degreeRadianRatio;
	}
	_toDeg(rad) {
		let _degreeRadianRatio = 180 / Math.PI;
		return rad * _degreeRadianRatio;
	}

	_buildChart() {
		let self=this;
		let timeline=null;

		let svg=this.container
					.classed("circle",true)
					.append("svg")
					

		let defs = svg.append("defs");
		this._createIcons(defs) 

		let box=svg.node().getBoundingClientRect();
		let WIDTH = box.width,
			HEIGHT= box.height;
		
		this.padding={
			top:20,
			left:20,
			bottom:20,
			right:20
		}		

		this.margins={
			top:20,
			left:20,
			bottom:20,
			right:20
		}

		let RADIUS=WIDTH/2  - d3.max([this.margins.top,this.margins.bottom]) -  d3.max([this.padding.top,this.padding.bottom]);
		
		this.width2=WIDTH/2;
		this.height2=HEIGHT/2;

		let center = [box.width/2,box.height/2];
		
		console.log("EXTENTS",this.extents)

		this.xscale=d3.scale.linear().domain(this.extents.seconds).range([0,WIDTH-(this.margins.left+this.margins.right)])
		this.yscale=d3.scale.linear().domain([0,this.max_score || this.extents.score]).range([HEIGHT-(this.margins.top+this.margins.bottom),0])
		
		

		this.radius_scale=d3.scale.linear().domain([0,this.max_score]).range([0,RADIUS]);
		this.radius_scale.domain([0,this.extents.score[1]])

		this.alpha_scale=d3.scale.linear().domain(this.extents.seconds).range([0,360])				
		
		//console.log(this.alpha_scale.domain(),this.alpha_scale.range(),"!!!!!")
		
		let circleLine = d3.svg.line()
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
		
		let axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(WIDTH/2)+","+(HEIGHT/2)+")");

		let evts=svg.append("g")
					.attr("class","events")
					.attr("transform","translate("+center[0]+","+center[1]+")");

		let lead_circle=svg.append("g")
							.attr("class","lead-circle")
							.attr("transform","translate("+center[0]+","+center[1]+")");

		let team=svg.append("g")
						.attr("class","teams")
						.attr("transform","translate("+center[0]+","+center[1]+")")
						.selectAll("g.team")
						.data(nested_data.filter(function(d,i){
							return 1;//i===0;
						}))
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
				.datum(function(d){
					var values=d.values.events.filter(function(d){
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
						});
					return values.map(function(d,i){
						
						if(values[i+1]) {

							let d1=values[i+1],
								r1=self.radius_scale(d.score),
								a1=self._toRad(self.alpha_scale(d.seconds)),
								r2=self.radius_scale(d1.score),
								a2=self._toRad(self.alpha_scale(d1.seconds));

							d.seconds2=d1.seconds;
							d.score2=d1.score;

							d.r1 = r1;
							d.r2 = r2;
							d.larg_arc = (self.alpha_scale(d1.seconds) - self.alpha_scale(d.seconds)> 180)?1:0;

							d.x1 = r1 * Math.cos(Math.PI/2-a1),
							d.y1 = -(r1*Math.sin(Math.PI/2-a1)),
							d.x2 = r1 * Math.cos(Math.PI/2-a2),
							d.y2 = -(r1*Math.sin(Math.PI/2-a2));

							d.x3 = r2 * Math.cos(Math.PI/2-a2),
							d.y3 = -(r2*Math.sin(Math.PI/2-a2));

						}
						

						return d;
					});
				})
					.attr("d",(p) => {
						
						console.log(p)

						var path="";
						//console.log(i,"radius:",radius,"alpha",alpha,Math.PI/2-alpha,self._toDeg(Math.PI/2-alpha))

						p.filter(function(d){return (typeof d.x2 !== 'undefined');}).forEach(function(d){
							
							path+="M"+d.x1+","+d.y1;
							//path+="L"+d.x2+","+d.y2;
							
							path+="A"+d.r1+" "+d.r1+" 0 "+d.larg_arc+" 1 "+d.x2+" "+d.y2;

							path+="L"+d.x3+","+d.y3
						})

						return path;
					})


		team.append("circle")
				.attr("cx",function(d){
					let last_event=d.values.events[d.values.events.length-1],
						r=self.radius_scale(last_event.score),
						a=self._toRad(self.alpha_scale(last_event.seconds));
						d.x1 = r * Math.cos(Math.PI/2-a),
						d.y1 = -(r*Math.sin(Math.PI/2-a));
					return d.x1;
				})
				.attr("cy",function(d){	
					return d.y1;
				})
				.attr("r",this.options.small?1.5:3)
		
		team.append("text")
				.attr("class","team-name")
				.attr("x",function(d){
					return d.x1
				})
				.attr("dx",5)
				.attr("y",function(d){
					return d.y1
				})
				.attr("dy",function(d){
					//console.log(d.key,d,self.extents.score[1])
					/*var delta=RADIUS - Math.abs(d.y1);
					console.log(d,d.y1,RADIUS,delta)
					if(delta>0 && delta<9) {
						return 10;
					}
					return "0.25em";*/
					console.log("DDDDD",d)
					if(d.values.score<self.extents.score[1]) {
						return 14;
					}
					return -5;
				})
				.text(function(d){
					return self.teams_info[d.key]["short_name"] + " " +d.values.score;
					return self.teams_info[d.key][self.options.country_field||name] + " " +d.values.score;
				})
		
		


		axes.selectAll("circle")
				.data(this.radius_scale.ticks(3))
				.enter()
				.append("circle")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",function(d){
					return self.radius_scale(d);
				})

		axes.append("line")
				.attr("x1",0)
				.attr("y1",0)
				.attr("x2",0)
				.attr("y2",-RADIUS)

		axes.selectAll("text")
				.data(this.radius_scale.ticks(3).filter(function(d){return d>0;}))
				.enter()
				.append("text")
				.attr("x",0)
				.attr("y",function(d){
					return -self.radius_scale(d)+12;
				})
				.text(function(d){
					return d;
				})
		
		let evt=evts.selectAll("g.evt")
					.data(nested_data[0].values.events.concat(nested_data[1].values.events).filter(function(d){
						return d.seconds>0 && d.type!=="sub off" && d.type!=="sub on" && d.type!=="second half start" && d.type!=="first half end" && d.type!=="second half end";
					}))
					/*.data(nested_data[0].values.events.filter(function(d){
						return d.seconds>0;
					}))*/
					.enter()
					.append("g")
						.attr("class",(d) => {
							return self.teams_info[d.team_id].nid+" evt "+d.type.replace(/\s/gi,"-");
						})

		evt
			.filter((d) => {
				return d.type !== "red card" && d.type !== "yellow card";
			})
			.append("line")
				.attr("rel",(d) => {
					return d.minute+":"+d.second;
				})
				.attr("x1",(d) => {

					if(!d.x0) {
						let r=self.radius_scale(d.score)+3,
							a=self._toRad(self.alpha_scale(d.seconds));
							d.x0 = r * Math.cos(Math.PI/2-a),
							d.y0 = -(r*Math.sin(Math.PI/2-a));
						return d.x0;	
					}
					return d.x0;
				})
				.attr("y1",(d) => {
					return d.y0;
				})
				.attr("x2",(d) => {
					let r=RADIUS+self.padding.top,//self.radius_scale(d.score),
						a=self._toRad(self.alpha_scale(d.seconds));
						d.__x1 = r * Math.cos(Math.PI/2-a),
						d.__y1 = -(r*Math.sin(Math.PI/2-a));
					return d.__x1;
				})
				.attr("y2",function(d){
					return d.__y1;
				})
		let icon=evt.append("g")
				.attr("class","icon")
				.attr("transform",(d) => {
					let r=RADIUS+self.padding.top+5,//self.radius_scale(d.score),
						a=self._toRad(self.alpha_scale(d.seconds));
						d.___x1 = r * Math.cos(Math.PI/2-a),
						d.___y1 = -(r*Math.sin(Math.PI/2-a));
					return "translate("+d.___x1+","+d.___y1+")"
				})
		icon.append("circle")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",9)
		icon.append("use")
				.attr("class",(d) => {
					return d.type.replace(/\s/gi,"-")+"-icon"
				})
				.attr("xlink:href",function(d){
					return "#"+d.type.replace(/\s/gi,"-");
				})
				.attr("x",0)
				.attr("y",0)
				.attr("transform","translate(0,4)");



		let lead_arc=lead_circle.selectAll("g.arc")
									.data(this.arcs)
									.enter()
									.append("g")
										.attr("class",function(d){
											//console.log(d)
											return "arc "+(d.team_id?self.teams_info[d.team_id].nid:"tie");
										})
		lead_arc.append("path")
					.attr("d",function(d){
						//console.log(d)
						let radius=RADIUS+5,
							a1=self._toRad(self.alpha_scale(d.seconds[0])),
							a2=self._toRad(self.alpha_scale(d.seconds[1]));

						let x1 = radius * Math.cos(Math.PI/2-a1),
							y1 = -(radius*Math.sin(Math.PI/2-a1)),
							x2 = radius * Math.cos(Math.PI/2-a2),
							y2 = -(radius*Math.sin(Math.PI/2-a2));

						let larg_arc = (self.alpha_scale(d.seconds[1]) - self.alpha_scale(d.seconds[0])> 180)?1:0;

						let path="M"+x1+","+y1;
						//path+="L"+x2+","+y2;
						path+="A"+radius+" "+radius+" 0 "+larg_arc+" 1 "+x2+" "+y2;

							
						return path;

					})

		let filterMatchAtSeconds = (seconds) => {

			team.select("path")
				.datum((d) => {
						var values=d.values.events.filter((d) => {
							return 	d.seconds <= seconds
									&&
									(d.type==="first half start"
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
									d.type=="drop goal");
						});
						return values;
					})
					.attr("d",(p) => {
						
						//console.log(p)

						var path="";
						//console.log(i,"radius:",radius,"alpha",alpha,Math.PI/2-alpha,self._toDeg(Math.PI/2-alpha))

						p.filter((d) => {return (typeof d.x2 !== 'undefined');}).forEach((d) => {
							
							path+="M"+d.x1+","+d.y1;
							//path+="L"+d.x2+","+d.y2;
							
							path+="A"+d.r1+" "+d.r1+" 0 "+d.larg_arc+" 1 "+d.x2+" "+d.y2;

							path+="L"+d.x3+","+d.y3
						})

						return path;
					})


			evt.classed("hidden",(d) => {
				return d.seconds > seconds;
			})

			team.select("circle")
				.attr("cx",function(d){
					var values=d.values.events.filter((d) => {
							return 	d.seconds <= seconds
									&&
									(d.type==="first half start"
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
									d.type=="drop goal");
						});

					let last_event=values[values.length-1],
						r=self.radius_scale(last_event.score2),
						a=self._toRad(self.alpha_scale(last_event.seconds2));
						d.__tx1 = r * Math.cos(Math.PI/2-a),
						d.__ty1 = -(r*Math.sin(Math.PI/2-a));
					return d.__tx1;
				})
				.attr("cy",function(d){	
					return d.__ty1;
				})
				

		}

		svg.on("mousemove",function(){
						return;
						let coords=d3.mouse(this),
							alpha=self._getAlphaFromCoords(coords,[self.width2,self.height2]);

						let seconds=self.alpha_scale.invert(alpha<0?360+alpha:alpha);

						console.log(alpha,seconds)

						filterMatchAtSeconds(seconds)

					})

		

	}
	_getCoordsAt(score,seconds) {
			
		let r=this.radius_scale(score),
			a=this._toRad(this.alpha_scale(seconds));

		return [
			r * Math.cos(Math.PI/2-a),
			-(r*Math.sin(Math.PI/2-a))
		];

	}
	_getAlphaFromCoords(coords,center) {
		
		let circle_coords=[coords[0] - center[0],coords[1]-center[1]]
		
		let alpha = Math.atan2(circle_coords[1],circle_coords[0])+Math.PI/2;

		console.log(coords,circle_coords,alpha,this._toDeg(alpha))

		return this._toDeg(alpha);
	}

	_createIcons(defs) {

		//penalty
		let penalty=defs.append("g")
						.attr("id","penalty");
		penalty.append("line")
					.attr("x1",-3)
					.attr("y1",0)
					.attr("x2",-2)
					.attr("y2",-8)
		penalty.append("line")
					.attr("x1",3)
					.attr("y1",0)
					.attr("x2",2)
					.attr("y2",-8)
		penalty.append("line")
					.attr("x1",-2)
					.attr("y1",-3)
					.attr("x2",2)
					.attr("y2",-3)

		//conversopm
		let conversion=defs.append("g")
						.attr("id","conversion");
		conversion.append("line")
					.attr("x1",-3)
					.attr("y1",0)
					.attr("x2",-2)
					.attr("y2",-8)
		conversion.append("line")
					.attr("x1",3)
					.attr("y1",0)
					.attr("x2",2)
					.attr("y2",-8)
		conversion.append("line")
					.attr("x1",-2)
					.attr("y1",-3)
					.attr("x2",2)
					.attr("y2",-3)

		//missed-drop-goal
		let drop_goal=defs.append("g")
						.attr("id","drop-goal");
		drop_goal.append("line")
					.attr("x1",-3)
					.attr("y1",0)
					.attr("x2",-2)
					.attr("y2",-8)
		drop_goal.append("line")
					.attr("x1",3)
					.attr("y1",0)
					.attr("x2",2)
					.attr("y2",-8)
		drop_goal.append("line")
					.attr("x1",-2)
					.attr("y1",-3)
					.attr("x2",2)
					.attr("y2",-3)

		//missed-drop-goal
		let missed_drop_goal=defs.append("g")
						.attr("id","missed-drop-goal");
		missed_drop_goal.append("line")
					.attr("x1",-3)
					.attr("y1",0)
					.attr("x2",-2)
					.attr("y2",-8)
		missed_drop_goal.append("line")
					.attr("x1",3)
					.attr("y1",0)
					.attr("x2",2)
					.attr("y2",-8)
		missed_drop_goal.append("line")
					.attr("x1",-2)
					.attr("y1",-3)
					.attr("x2",2)
					.attr("y2",-3)

		let redcard=defs.append("g")
						.attr("id","red-card");
		redcard.append("rect")
					.attr("x",-3)
					.attr("y",-8)
					.attr("width",6)
					.attr("height",8)
		let yellowcard=defs.append("g")
						.attr("id","yellow-card");
		yellowcard.append("rect")
					.attr("x",-3)
					.attr("y",-8)
					.attr("width",6)
					.attr("height",8)

		let _try=defs.append("g")
						.attr("id","try");
		let _try_g=_try.append("g")
					.attr("transform","rotate(-20)")
		_try_g.append("ellipse")
					.attr("cx",1)
					.attr("cy",-4)
					.attr("rx",3)
					.attr("ry",5)

		var l=3;
		let sub=defs.append("g")
						.attr("id","sub");
		sub.append("line")
					.attr("x1",-l)
					.attr("y1",0)
					.attr("x2",0)
					.attr("y2",-l)
		sub.append("line")
					.attr("x1",0)
					.attr("y1",-l)
					.attr("x2",l)
					.attr("y2",0)

		sub.append("line")
					.attr("x1",-l)
					.attr("y1",2)
					.attr("x2",0)
					.attr("y2",2+l)
		sub.append("line")
					.attr("x1",0)
					.attr("y1",2+l)
					.attr("x2",l)
					.attr("y2",2)

		
	}

}