import iframeMessenger from 'guardian/iframe-messenger'
import d3 from 'd3'
import RAF from './lib/raf'
import mainHTML from './text/main.html!text'
import matches_data from '../assets/data/matches.json!json';
import data from '../assets/data/data.json!json';
import Match from './charts/CircleMatch';
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
        //console.log(time)
        var b=document.querySelector(".final");
        if(b && b.getBoundingClientRect().height) {
            cancelAnimationFrame(checkInnerHTML);
            loadData()
            //chartNow();
            return; 
        }
        frameRequest = requestAnimationFrame(checkInnerHTML);
    });

    function loadData() {
        //d3.json("http://localhost:8080",function(data){

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

        //})
    }
    function chartNow(matches) {
        //console.log(matches);
        
        d3.select("#rwc")
            .attr("class","circle")
        
        var finals=d3.select(".final .contents")
                        //.append("div")
                        //.attr("class","matches")
                            .selectAll("div.match")
                            .data(matches.filter(function(d){
                                return d.id === "101548" 
                            }))
                            //.enter()
                            //.append("div")
                                .attr("class","match")// with-timeline")
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
                                        country_field:"name",
                                        extralarge:true,
                                        cup:true,
                                        config:config,
                                        small:false,
                                        margins:{
                                            top:20,
                                            bottom:20,
                                            left:80,
                                            right:90
                                        },
                                        timeline:true,
                                        arrow:true
                                    })    
                                })
        
        var sf=d3.select(".semi-finals .contents")
                        //.append("div")
                        //.attr("class","matches")
                            .selectAll("div.match")
                            .data(matches.filter(function(d){
                                return d.info._group === "SF" 
                            }))
                            //.enter()
                            //.append("div")
                                .attr("class","match with-timeline")
                                .attr("rel",function(d){
                                    return d.teams[0].nid+" vs "+d.teams[1].nid;
                                })
                                .attr("data-match-id",function(d){
                                    return d.id;
                                })
                                .each(function(d){
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
        

        var qf=d3.select(".quarter-finals .contents .matches")
                        //.append("div")
                        //.attr("class","matches")
                            .selectAll("div.match")
                            .data(matches.filter(function(d){
                                return d.info._group === "QF" 
                            }).sort(function(a,b){
                                var order=["101541","101542","101544","101543",]
                                return order.indexOf(a.info._id) - order.indexOf(b.info._id);
                            }))
                            //.enter()
                            //.append("div")
                                .attr("class","match with-timeline")
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

        d3.selectAll(".road")
            .each(function(d){
                new Road({
                    container:this
                })    
            })
        

        

        d3.selectAll(".pools")
                .each(function(){
                    var pool=d3.select(this),
                        pool_id=pool.attr("data-pool-id");
                    
                    pool.select(".contents")
                        .append("div")
                        .attr("class","pool")
                        .append("div")
                        .attr("class","matches")
                        .selectAll("div.match")
                        .data(function(pool){
                            return matches.filter(function(d){
                                return d.info._group === pool_id
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
                                ////console.log(d)
                                new Match(d.json,{
                                    id:"#"+d.id,
                                    container:this,
                                    appendChart:true,
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

                })
        
        
        
        
        
        
        
        
        

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
                    ////console.log(d)
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
