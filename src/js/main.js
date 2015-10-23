import iframeMessenger from 'guardian/iframe-messenger'
import d3 from 'd3'
import mainHTML from './text/main.html!text'
/*import QF_SCvsAU from '../assets/data/QF_SCvsAU.json!json'
import QF_NZvsFR from '../assets/data/QF_NZvsFR.json!json'
import QF_IEvsAR from '../assets/data/QF_IEvsAR.json!json'
import QF_SAvsWA from '../assets/data/QF_SAvsWA.json!json'*/
import matches_data from '../assets/data/matches.json!json';
import Match from './charts/Match';
import Road from './charts/Road';
import { matches } from './charts/matches';
import { match_ids } from './charts/matches';
import { iso } from './charts/countries';
import { short_names } from './charts/countries';
import { pools } from './charts/countries';


import { requestAnimationFrame, cancelAnimationFrame } from './lib/request-animation-frame-shim';

export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    let frameRequest = requestAnimationFrame(function checkInnerHTML(time) {
        console.log(time)
        var b=document.querySelector("#rwc");
        if(b && b.getBoundingClientRect().height) {
            cancelAnimationFrame(checkInnerHTML);
            loadData()
            //chartNow();
            return; 
        }
        frameRequest = requestAnimationFrame(checkInnerHTML);
    });

    function loadData() {
        d3.json("http://localhost:8080",function(data){

            var matches=data.map(function(m){
                var match={
                    id:m.RRML["$"].id,
                    date:new Date(m.RRML["$"].timer_timestamp),
                    json:m,
                    info:getMatchInfo(m.RRML["$"].id)
                };
                match.teams=[
                    {
                        id:m.RRML["$"].away_team_id,
                        nid:iso[m.RRML["$"].away_team],
                        name:m.RRML["$"].away_team,
                        short_name:short_names[m.RRML["$"].away_team]
                    },
                    {
                        id:m.RRML["$"].home_team_id,
                        nid:iso[m.RRML["$"].home_team],
                        name:m.RRML["$"].home_team,
                        short_name:short_names[m.RRML["$"].home_team]
                    }
                ];
                return match;
            })

            chartNow(matches.sort(function(a,b){
                return +a.date - +b.date;
            }));

        })
    }
    function chartNow(matches) {
        console.log(matches);
        
        var pool=d3.select(".pools .contents")
            .selectAll("div.pool")
            .data(["A","B","C","D"])
            .enter()
            .append("div")
                .attr("class","pool")

        pool.append("div")
                .attr("class","matches")
                .selectAll("div.match")
                .data(function(pool){
                    return matches.filter(function(d){
                        return d.info._group === pool 
                    })
                })
                .enter()
                .append("div")
                    .attr("class","match small gray")
                    .attr("rel",function(d){
                        return d.teams[0].nid+" vs "+d.teams[1].nid;
                    })
                    .attr("data-match-id",function(d){
                        return d.id;
                    })
                    .each(function(d){
                        //console.log(d)
                        new Match(d.json,{
                            id:"#"+d.id,
                            container:this,
                            teams:d.teams,
                            max_score:65,
                            country_field:"short_name",
                            small:true,
                            margins:{
                                top:20,
                                bottom:20,
                                left:10,
                                right:40
                            }
                        })    
                    })
                    .on("mouseenter",function(){
                        d3.select(this).classed("gray",false)
                    })
                    .on("mouseleave",function(){
                        d3.select(this).classed("gray",true)
                    })
        var qf=d3.select(".quarter-finals .contents")
                        .append("div")
                        .attr("class","matches")
                            .selectAll("div.match")
                            .data(matches.filter(function(d){
                                return d.info._group === "QF" 
                            }).sort(function(a,b){
                                var order=["101541","101544","101542","101543",]
                                return order.indexOf(a.info._id) - order.indexOf(b.info._id);
                            }))
                            .enter()
                            .append("div")
                                .attr("class","match with-timeline")
                                .attr("rel",function(d){
                                    return d.teams[0].nid+" vs "+d.teams[1].nid;
                                })
                                .attr("data-match-id",function(d){
                                    return d.id;
                                })
                                .each(function(d){
                                    console.log(d)
                                    new Match(d.json,{
                                        id:"#"+d.id,
                                        container:this,
                                        teams:d.teams,
                                        max_score:65,
                                        country_field:"short_name",
                                        small:false,
                                        margins:{
                                            top:20,
                                            bottom:20,
                                            left:40,
                                            right:40
                                        },
                                        timeline:true
                                    })    
                                })
        
        var sf=d3.select(".semi-finals .contents")
                        .append("div")
                        .attr("class","matches")
                            .selectAll("div.match")
                            .data(matches.filter(function(d){
                                return d.id === "101535" || d.id==="101527" 
                            }))
                            .enter()
                            .append("div")
                                .attr("class","match with-timeline")
                                .attr("rel",function(d){
                                    return d.teams[0].nid+" vs "+d.teams[1].nid;
                                })
                                .attr("data-match-id",function(d){
                                    return d.id;
                                })
                                .each(function(d){
                                    console.log(d)
                                    new Match(d.json,{
                                        id:"#"+d.id,
                                        container:this,
                                        teams:d.teams,
                                        max_score:65,
                                        country_field:"short_name",
                                        small:false,
                                        margins:{
                                            top:20,
                                            bottom:20,
                                            left:40,
                                            right:40
                                        },
                                        timeline:true
                                    })    
                                })
        
        var finals=d3.select(".final .contents")
                        .append("div")
                        .attr("class","matches")
                            .selectAll("div.match")
                            .data(matches.filter(function(d){
                                return d.id === "101504" 
                            }))
                            .enter()
                            .append("div")
                                .attr("class","match with-timeline")
                                .attr("rel",function(d){
                                    return d.teams[0].nid+" vs "+d.teams[1].nid;
                                })
                                .attr("data-match-id",function(d){
                                    return d.id;
                                })
                                .each(function(d){
                                    console.log(d)
                                    new Match(d.json,{
                                        id:"#"+d.id,
                                        container:this,
                                        teams:d.teams,
                                        max_score:65,
                                        country_field:"name",
                                        small:false,
                                        margins:{
                                            top:20,
                                            bottom:20,
                                            left:80,
                                            right:90
                                        },
                                        timeline:true
                                    })    
                                })
        
        /*d3.selectAll(".road")
            .each(function(d){
                new Road({
                    container:this
                })    
            })*/

        return;
        /*d3.select("#rwc")
            .selectAll("div.match")
            .data(matches)
            .enter() 
            .append("div")
                .attr("rel",function(d){
                    return d.id;
                })
                .attr("class","match")
                .each(function(d){
                    //console.log(d)
                    new Match(d.json,{
                        id:"#"+d.id,
                        container:this,
                        teams:d.teams,
                        max_score:70
                    })    
                })*/
    }
    function getMatchInfo(gid) {
        return matches_data.fixtures.fixture.find(function(fixture){
            return fixture._id==gid;
        })
    }
}
