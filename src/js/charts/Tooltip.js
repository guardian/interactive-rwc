export default class Tooltip {

	constructor(options) {

		var w=options.width || 200,
			h=options.height || 110;

		this.options=options;
		//console.log("!!!!!!!!!!!",options)

		this.tooltip=d3.select(options.container)
						.append("div")
							.attr("class","tooltip")

		var arrowBox=this.tooltip.append("div")
							.attr("class","arrow_box clearfix")
							.style("min-width",w+"px")

		if(options.padding) {
			arrowBox.style("padding",options.padding)
		}

		
		if(options.title) {
			this.tooltipTitle=arrowBox.append("h1")
				.attr("class","tooltip-title")
				.text("title");
		}

		//var indicator;
		if(options.html) {
			arrowBox.html(options.html);

			this.indicator=arrowBox.selectAll("span")
					.data(options.indicators)
					.attr("id",function(d){
						return d.id;
					})
					.classed("value",1)
		} else {
			this.indicator=arrowBox.selectAll("div.indicator")
					.data(options.indicators,function(d){
						return d.id;
					})
					.enter()
					.append("div")
						.classed("indicator",1)
						.classed("clearfix",1)

			var value=indicator.append("span")
						.classed("value",1)
						.attr("id",function(d){
							return d.id;
						});

			this.indicator.append("span")
						.attr("class","title")
						.text(function(d){
							return d.title;
						});
		}

	}
	
	

	

	hide() {
		this.tooltip.classed("visible",false);
	}

	show(data,x,y,title,max_width) {
		////console.log(x,y)
		//percentage.text(data.percentage+"%");
		//projection_value.text(data.total)
		let self=this;

		if(title) {
			this.tooltipTitle.text(title);	
		}
		

		this.indicator.data(data);
		/*.data(options.indicators,function(d){
			return d.id;
		})*/

		this.indicator//.select("span.value")
			.text(function(d){
				////console.log("AAAHHHHHHHHHH",d,this)
				return d.value;
			})

		this.tooltip
			.classed("right",function(){
				if(!max_width) {
					return 0;
				}
				if(x+16+self.options.margins.left+w>max_width) {
					return 1;
				}
				return 0;
			})
			/*.style({
				left:(x+16+options.margins.left)+"px",
				top:(y+options.margins.top-25)+"px"
			})*/
			.style("top",(y+self.options.margins.top-25)+"px")
			.style("left",function(){
				return (x+self.options.margins.left)+"px";
			})
			.classed("visible",true)
			
		
	};

}