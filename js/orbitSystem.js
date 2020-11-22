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


    constructor(_parentElement, legendElement,satelliteData, geoData) {
        this.parentElement = _parentElement;
        this.legendElement= legendElement;
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


        vis.margin = {top: -10, right: 20, bottom: 20, left: -100};
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

        // set up legend svg
        vis.marginLegend = {top: 0, right: 0, bottom: 100, left: 0};
        vis.widthLegend = $("#" + vis.legendElement).width() - vis.marginLegend.left - vis.marginLegend.right;
        vis.heightLegend = $("#" + vis.legendElement).height() - vis.marginLegend.top - vis.marginLegend.bottom;

        vis.svg2 = d3.select("#" + vis.legendElement).append("svg")
            .attr("width", vis.widthLegend + vis.marginLegend.left + vis.marginLegend.right)
            .attr("height", vis.heightLegend + vis.marginLegend.top + vis.marginLegend.bottom)
            .append('g')

        // create slider https://refreshless.com/nouislider
        // since the slider was literally my nemesis for hw 6, I very gratefully just followed along with Ben's hw 6 review.


        // updateRangeSliderValues(originalTimePeriod);
        // vis.slider.noUiSlider.on('slide', function(values, handle){
        //     updateRangeSliderValues(values);
        //     vis.wrangleData()
        // })



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

        // config variables for rotation of globe -- commented out because rotating globes makes rotation of everything extremely choppy
        // vis.config = {
        //     speed: 0.005,
        //     verticalTilt: -10,
        //     horizontalTilt: 0
        // }

        // ****************************************
        //             Legend
        // ****************************************


        // create legend item
        vis.legend = vis.svg2.append("g")
            .attr("class", "orbitLegend")

        // initialize legend data array
        vis.legendData = [];

        //initialize date filter
        // vis.originalTimePeriod = d3.extent(vis.satData, d=>d.Date)
        // console.log(vis.originalTimePeriod)
        //
        // vis.timePeriodMin =vis.originalTimePeriod[0];
        // vis.timePeriodMax =vis.originalTimePeriod[1];

        // vis.timePeriodMin = document.getElementById("time-period-min").value;
        // vis.timePeriodMax = document.getElementbyId("time-period-max").value;




        vis.wrangleData()

    }

    wrangleData() {
        let vis = this;

        vis.selectedSatCategory = selectedSatCategory;

        // ****************************************
        //             Satellites
        // ****************************************

        // filter out entries where Period is NaN - removes about 20
        vis.satData1 = vis.satData.filter((d,i)=>{
            if (!isNaN(d.Period)){
                return d
            }
        })

        vis.filteredData = vis.satData1.filter(d=>{
            return d.Date >= vis.timePeriodMin && d.Date <=vis.timePeriodMax;
        })

        //set up filter by Date

        // set up color
        // set color based on selected Category


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
                vis.R = Math.floor(Math.random() * 16) + 55 // radius of planet is 50. chose 55 to have a bit of a buffer

            } else if (d["Class of Orbit"]=="MEO"){
                vis.R = Math.floor(Math.random() * 145) + 66

            } else if (d["Class of Orbit"]=="GEO" | d["Class of Orbit"]=="Elliptical"){
                vis.R = Math.floor(Math.random() * 119) + 211
            }

            // phi0 is the starting angle coordinate
            // make it random between 0 and 359 so they are spread out around the orbit
            phi0 = (Math.random()*100)*3+(Math.random()*10)*5+(Math.random()*9) //generate random starting point between 0 and 360


            vis.satellites.push({
                R: vis.R,
                r: 3,
                speed: vis.periodScale(d.Period),
                phi0: phi0,
                color: vis.color,
                Country : d.Country,
                Purpose : d.Purpose,
                Users : d.Users,
                Orbit: d["Class of Orbit"]
            })

        })

        if (vis.selectedSatCategory=="default"){
            vis.legendStatus = false;
            vis.color="#00ffd4"

            vis.satellites.forEach((d,i)=>{
                d.color=vis.color
            })

        } else if (vis.selectedSatCategory == "country"){
            // console.log(vis.selectedSatCategory)
            vis.legendStatus = true;
            vis.legendData = ["USA", "China", "Russia", "United Kingdom", "Japan", "Other"]
            vis.color = d3.scaleOrdinal()
                .range(["#0a60b1", "#7431c4", "#9f0797", "#640345", "#800000", "#ee6666"])
                .domain(vis.legendData)

            console.log(vis.color("Other"))

            vis.satellites.forEach((d,i)=>{
                // console.log(d.Country)
                d.color=vis.color(d.Country)
                // console.log(d.color)

            })
        } else if (vis.selectedSatCategory == "purpose"){
            console.log(vis.selectedSatCategory)
            vis.legendStatus = true;
            vis.legendData = ["Communications", "Earth Science", "Navigation", "Space Science", "Other"]
            vis.color = d3.scaleOrdinal()
                .range(["#ec0505", "#f58702", "#ffeb04", "#8eac07", "#12cee7"])
                .domain(vis.legendData)

            vis.satellites.forEach((d,i)=>{
                // console.log(d.Purpose)
                d.color=vis.color(d.Purpose)
                // console.log(d.color)

            })
        }  else if (vis.selectedSatCategory == "orbit"){
            console.log(vis.selectedSatCategory)
            vis.legendStatus = true;
            vis.legendData = ["LEO", "MEO", "GEO", "Elliptical"]
            vis.color = d3.scaleOrdinal()
                .range(["#0b3701", "#08e2b0", "#2f96e7", "#490cbc" ])
                .domain(vis.legendData)

            vis.satellites.forEach((d,i)=>{
                // console.log(d.Orbit)
                d.color=vis.color(d.Orbit)
                // console.log(d.color)

            })
        }else {
            console.log("nah")
        }



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

            // unfortunately, trying to rotate the globe makes everything super choppy :/

            // vis.projection.rotate([vis.delta/10, vis.config.verticalTilt, vis.config.horizontalTilt])
            // vis.svg.selectAll("path")
            //     .merge(vis.countries)
            //     .attr("d", vis.globePath);


        }, 10);

        // set up stuff for the labels
        vis.legendSquares = vis.legend
            .attr("class", "legendSquares")
            .selectAll(".legendSquare")
            .data(vis.legendData);

        vis.legendLabels = vis.legend
            .attr("class", "legendLabels")
            .selectAll(".legendLabel")
            .data(vis.legendData);

        // grab the legend text element to update the text box
        // vis.body = d3.select("#legendText")

        //toggle legend
        if (vis.legendStatus == true) {
            var size = 20;

            // make the legend color squares
            vis.legendSquares
                .enter()
                .append("rect")
                .attr("class", "legendSquare")
                .merge(vis.legendSquares)
                .attr("x", 20)
                .attr("y", function (d, i) {
                    return 100 + i * (size + 5)
                }) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("width", size)
                .attr("height", size)
                .style("fill", function (d) {
                    return vis.color(d)
                });

            // make the legend text, colored the same
            vis.legendLabels
                .enter()
                .append("text")
                .attr("class", "legendLabel")
                .merge(vis.legendLabels)
                .attr("x", 60)
                .attr("y", function (d, i) {
                    return 100 + i * (size + 5) + (size / 2)
                })
                .style("fill", function (d) {
                    return vis.color(d)
                })
                .text(function (d) {
                    if (vis.selectedCategory == "status") {
                        if (d == "StatusActive") {
                            return "Active"
                        } else {
                            return "Retired"
                        }
                    } else if (vis.selectedCategory == "total") {
                        // console.log(d)
                        if (d === 2) {
                            return "0-2"
                        } else if (d === 5) {
                            return "3-5"
                        } else if (d==18){
                            return "6-18"
                        } else {
                            return "19-588"
                        }

                    }
                    else {
                        return d
                    }
                })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle");

            //remove the current text box if there is one
            // vis.body.selectAll("p").remove();

            // add new text info
            // vis.body.append("p").text(vis.legendText[0])

            // update legend stuffs
            vis.legendSquares.exit().remove();
            vis.legendLabels.exit().remove();

        } else if (vis.legendStatus == false) {
            // if legend is off, remove all the stuff and wipe the slate clean
            vis.legendLabels.remove();
            vis.legendSquares.remove();
            // vis.body.selectAll("p").remove();

        }


    }
}// establish variables

