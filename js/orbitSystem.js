/*
* OrbitSystem - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*
*
 *
 * author: Zane
 * modified from: http://bl.ocks.org/codybuell/fc2426aedabef2d69873
 * date created: 11/19/2020
 * date last modified:
 */
class OrbitSystem {


    constructor(_parentElement, satelliteData, geoData) {
        this.parentElement = _parentElement;
        this.geoData = geoData;
        this.satData = satelliteData;

        console.log(this.satData)

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {

        let vis = this;


        vis.margin = {top: -10, right: 20, bottom: 20, left: -200};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        // vis.svg = d3.select("#" + vis.parentElement)
        //     .attr("width", vis.width)
        //     .attr("height", vis.height)
        //     .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // var w     = 1600;
        // var h     = 1400;
        vis.x = (vis.width / 2);
        vis.y = vis.height / 2;
        vis.t0 = new Date().setHours(0, 0, 0, 0);
        vis.delta = (Date.now() - vis.t0);

// insert svg element
        vis.svg = d3.select("#" + vis.parentElement).insert("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // ****************************************
        //             GLOBE
        // ****************************************

        // //draw globe
        vis.projection = d3.geoOrthographic()
            //d3.geoStereographic()//
            .scale(50)
            .translate([vis.width / 2, vis.height / 2])
        // .clipAngle(90);

        vis.globePath = d3.geoPath()
            .projection(vis.projection)
            .pointRadius(d => d.radius);

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;

        // sphere
        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("opacity", 0.5)
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.globePath);

        // config variables for rotation
        vis.config = {
            speed: 0.005,
            verticalTilt: -30,
            horizontalTilt: 0
        }


        vis.wrangleData()

    }

    wrangleData() {
        let vis = this;

        vis.selectedSatCategory = selectedSatCategory;
        // console.log(vis.selectedSatCategory)

        // vis.nans=0;

        // figure out how many nans there are - 890
        // vis.satData.forEach((d,i)=>{
        //     if (isNaN(d.Apogee)){
        //         vis.nans++;
        //     }
        //
        // })
        // console.log(vis.nans)
        // filter out entries where apogee is NaN - this will help cut down on dataset
        vis.filteredData = vis.satData.filter((d,i)=>{
            if (!isNaN(d.Period)){
                return d
            }
        })

        //set up filter by Date




        vis.satellites=[]


        // create scale to match orbiting velocity to period time
        vis.periodScale = d3.scaleLinear()
            .range([-0.5, -10])
            .domain([0,12000])


        vis.filteredData.forEach((d,i)=>{
            // console.log(d)
            let speed = 0;
            let phi0=0;
            vis.R=0;
            let r=0;

            r=2 //same size for all sats
            // for each class of orbit, generate a random number within acceptable range
            // randomness will help spread them out in space
            if (d["Class of Orbit"]=="LEO"){
                vis.R = Math.floor(Math.random() * 16) + 55

            } else if (d["Class of Orbit"]=="MEO"){
                vis.R = Math.floor(Math.random() * 145) + 66

            } else if (d["Class of Orbit"]=="GEO" | d["Class of Orbit"]=="Elliptical"){
                vis.R = Math.floor(Math.random() * 119) + 211
            }

            // phi0 is the starting x coordinate
            // make it random between 0 and 359 so they are spread out around the orbit
            phi0 = (Math.random()*100)*3+(Math.random()*10)*5+(Math.random()*9) //generate random starting point between 0 and 360

            // set color based on selected Category
            if (vis.selectedSatCategory=="default"){
                vis.color="#00ffd4"
            } else {
                vis.color = "red"
            }

            vis.satellites.push({
                R: vis.R,
                r: 3,
                speed: vis.periodScale(d.Period),
                phi0: phi0,
                name: d["Current Official Name of Satellite"],
                color: vis.color
            })

        })


        vis.displayData = vis.satellites;


        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        // draw the globe
        vis.globe = vis.svg.selectAll(".country")
            .data(vis.world)

        vis.countries = vis.globe
            .enter().append("path")
            .attr('class', 'country')
            .attr("fill", "green")
            .attr("opacity", 0.6)
            .merge(vis.globe)
            .attr("d", vis.globePath)

        // rotate the globe
        // commented out when debugging

        // planet group
        vis.container = vis.svg.append("g")
            .attr("id", "orbit_container")
            .attr("transform", "translate(" + vis.x + "," + vis.y + ")");

// draw planets and moon clusters
//         vis.svg.selectAll("g.planet").selectAll(".planet_cluster").remove();
        vis.satellites = vis.container.selectAll("g.planet_cluster")
            .data(vis.displayData);

        console.log(vis.satellites)

       vis.satGroups = vis.satellites
            .enter()
            .append("g")
            .attr("class", "planet_cluster")
           .merge(vis.satellites);

        vis.satGroups
            .append("circle")
            .attr("class", "planet")
            .attr("r", d=>d.r)
            .attr("cx", d=>d.R)
            .attr("cy", 0)
            .attr("stroke", "black")
            .style("stroke-width", 0.1)
            .attr("transform", function (d) {
                return "rotate(" + (d.phi0 + (vis.delta * (d.speed / 100))) + ")";
            })
            .style("fill", d=>d.color)
            .transition().duration(1000)
            .attr("transform", function (d) {
                return "rotate(" + (d.phi0 + (vis.delta * (d.speed / 100))) + ")";
            })
            .selection()
            .on("mouseover", function (event, d) {
            console.log(d)
        });

        console.log(vis.satellites)
        vis.satellites.exit().remove();

// throttled rotaiton animations
        setInterval(function () {
            vis.delta = (Date.now() - vis.t0);
            vis.svg.selectAll(".planet_cluster").merge(vis.container).attr("transform", function (d) {
                return "rotate(" + (d.phi0 + (vis.delta * (d.speed / 100))) + ")";
            })

        }, 40);


    }
}// establish variables

