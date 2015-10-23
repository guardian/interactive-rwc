export default class Timeline {

	constructor(data,options) {

		this.data=data;
		this.options=options;

		this.container=options.container;
		this.xscale=options.xscale;
		this.margins=options.margins;
		this.teams_info=options.teams_info;

		console.log(this.data,this.options)

		this._buildChart();
	}

	_buildChart() {
		let self=this;

		let timeline=this.container.append("div")
				.attr("class","timeline")

		let svg=timeline.append("svg");
		let box=svg.node().getBoundingClientRect();
		let WIDTH = box.width,
			HEIGHT= box.height;

		let defs = svg.append("defs");
		this._createIcons(defs) 

		let team_timeline=svg.selectAll("g.team-timeline")
				.data(this.data)
				.enter()
				.append("g")
					.attr("class","team-timeline")
					.attr("transform",(d,i) => {
						let x = self.margins.left,
							y = HEIGHT / 4 + (HEIGHT/2*i);
						return `translate(${x},${y})`
					})
		team_timeline.append("text")
				.attr("class","team-name")
				.attr("x",0)
				.attr("dx","-5")
				.attr("y",0)
				.attr("dy","0.25em")
				.text(d => {
					return self.teams_info[d.key][self.options.country_field||name];
				})

		team_timeline.append("line")
				.attr("class","time")
				.attr("x1",0)
				.attr("y1",0)
				.attr("x2",this.xscale.range()[1])
				.attr("y2",0)

		var evt=team_timeline.append("g")
						.attr("class","events")
							.selectAll("g.event")
								.data(d => {
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
								.attr("class",d => {
									return "event "+d.type.replace(/\s/gi,"-")
								})
								.attr("data-event",d => {
									return d.type;
								})
								.attr("transform",d => {
									//console.log(d)
									let x=self.xscale(d.seconds),
										y=0;
									return `translate(${x},${y})`;
								})
		evt
			.filter(d => {
				return d.type==="red card"
			})
			.append("use")
				.attr("class","red-card-icon")
				.attr("xlink:href","#card")
				.attr("x",0)
				.attr("y",9)
		evt
			.filter(d => {
				return d.type==="yellow card"
			})
			.append("use")
				.attr("class","yellow-card-icon")
				.attr("xlink:href","#card")
				.attr("x",0)
				.attr("y",10)

		evt
			.filter(d => {
				return d.type==="try"
			})
			.append("use")
				.attr("class","try-icon")
				.attr("xlink:href","#try")
				.attr("x",0)
				.attr("y",-1)

		/*evt
			.filter(function(d){
				return d.type!=="yellow card" && d.type!=="red card"
			})
			.append("circle")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",2)*/
		evt
			.filter(d => {
				return d.type==="penalty" || d.type==="conversion" || d.type==="drop goal"
			})
			.append("use")
				.attr("class","penalty-icon")
				.attr("xlink:href","#penalty")
				.attr("x",0)
				.attr("y",-1)

		evt
			.filter(d => {
				return d.type==="sub on"
			})
			.append("use")
				.attr("class","sub-icon")
				.attr("xlink:href","#sub")
				.attr("x",0)
				.attr("y",7)
				

	}

	_createIcons(defs) {

		//penalty
		let penalty=defs.append("g")
						.attr("id","penalty");
		penalty.append("line")
					.attr("x1",-2)
					.attr("y1",0)
					.attr("x2",-2)
					.attr("y2",-8)
		penalty.append("line")
					.attr("x1",2)
					.attr("y1",0)
					.attr("x2",2)
					.attr("y2",-8)
		penalty.append("line")
					.attr("x1",-2)
					.attr("y1",-3)
					.attr("x2",2)
					.attr("y2",-3)

		let card=defs.append("g")
						.attr("id","card");
		card.append("rect")
					.attr("x",-3)
					.attr("y",-8)
					.attr("width",6)
					.attr("height",8)

		let _try=defs.append("g")
						.attr("id","try");
		let _try_g=_try.append("g")
					.attr("transform","rotate(-20)")
		_try_g.append("ellipse")
					.attr("cx",0)
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