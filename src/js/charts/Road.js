export default class Road {

	constructor(options) {
		this.options=options;

		this._buildRoad();
	}

	_buildRoad() {

		let container=d3.select(this.options.container),
			phase=container.attr("data-road");

		let bbox=this.options.container.getBoundingClientRect(),
			width=bbox.width,
			height=bbox.height;

		var svg=container.append("svg");

		switch(phase) {

			case 'sf2f':
				svg.append("line")
						.attr("x1",width/4)
						.attr("y1",height)
						.attr("x2",width/4)
						.attr("y2",height/2)

				svg.append("line")
						.attr("x1",width-width/4)
						.attr("y1",height)
						.attr("x2",width-width/4)
						.attr("y2",height/2)

				svg.append("line")
						.attr("x1",width/2)
						.attr("y1",0)
						.attr("x2",width/2)
						.attr("y2",height/2)

				svg.append("line")
						.attr("x1",width/4)
						.attr("y1",height/2)
						.attr("x2",width-width/4)
						.attr("y2",height/2)
			break;
			case 'qf2sf':
				svg.append("line")
						.attr("x1",width/8)
						.attr("y1",height)
						.attr("x2",width/8)
						.attr("y2",height/2)

				svg.append("line")
						.attr("x1",width/2-width/8)
						.attr("y1",height)
						.attr("x2",width/2-width/8)
						.attr("y2",height/2)

				svg.append("line")
						.attr("x1",width/8)
						.attr("y1",height/2)
						.attr("x2",width/2-width/8)
						.attr("y2",height/2)

				svg.append("line")
						.attr("x1",width/4)
						.attr("y1",height/2)
						.attr("x2",width/4)
						.attr("y2",0)




				svg.append("line")
						.attr("x1",width/2+width/8)
						.attr("y1",height)
						.attr("x2",width/2+width/8)
						.attr("y2",height/2)

				svg.append("line")
						.attr("x1",width-width/8)
						.attr("y1",height)
						.attr("x2",width-width/8)
						.attr("y2",height/2)

				svg.append("line")
						.attr("x1",width/2+width/8)
						.attr("y1",height/2)
						.attr("x2",width-width/8)
						.attr("y2",height/2)

				svg.append("line")
						.attr("x1",width-width/4)
						.attr("y1",height/2)
						.attr("x2",width-width/4)
						.attr("y2",0)

				
			break;

		}


	}
 
}