/*
* OrbitSystem - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*
*
 *
 * author: Zane and Michael
 * contributions: Zane is responsible for the bulk of the code and Michael swooped in to solve enter/update/exit issues by separating the code out into separate functions and changing the animation procedure, and added the sat hover info table.
 * modified from: http://bl.ocks.org/codybuell/fc2426aedabef2d69873
 * date created: 11/19/2020
 * date last modified: 12/6/2020
 */
class OrbitSystem {


    constructor(_parentElement, legendElement,satelliteData, geoData) {
        this.parentElement = _parentElement;
        this.legendElement= legendElement;
        this.geoData = geoData;
        this.satData = satelliteData;
        this.selectedSatCategory = "default";

        // number of sats to display
        this.displayAmount = 1500;
        this.firstTime = true;

        // console.log(this.satData)

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        vis.margin = {top: -10, right: 20, bottom: 20, left: 0};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

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
        vis.marginLegend = {top: 0, right: 0, bottom: 10, left: 15};
        vis.widthLegend = $("#" + vis.legendElement).width() - vis.marginLegend.left - vis.marginLegend.right;
        vis.heightLegend = $("#" + vis.legendElement).height() - vis.marginLegend.top - vis.marginLegend.bottom;

        vis.svg2 = d3.select("#" + vis.legendElement).append("svg")
            .attr("width", vis.widthLegend + vis.marginLegend.left + vis.marginLegend.right)
            .attr("height", vis.heightLegend + vis.marginLegend.top + vis.marginLegend.bottom)
            .append('g')

        vis.orbitLegendTextAll=[
            ["There have been a total of 2787 satellites launched into orbit, carried there in the cargo bays of the rockets. Here the satellites have been encoded with realistic orbits and realistic orbiting speeds, and each circle represents a real satellite. For animation purposes, only a randomly-selected 1500 satellites of the total that have ever been launched (i.e. not just the ones currently in orbit) are included in this visualization at any time. (More and it becomes clunky. Also sometimes the animation makes the satellites orbit in a counter-clockwise fashion instead of clockwise. No idea why.)"],
            ["While we show the five countries with the most satellites in orbit explicitly, seventy-five different countries have sent satellites into orbit. Additionally, there have been at least 30 different collaborations between countries, the most popular of which is USA/Taiwan with 11 satellites."],
            ["The purposes have been binned into 5 major categories: Communication (1378), Earth Science (817), Other (344), Navigation (150), and Space Science (98). 'Other' includes such purposes as Education, Technology Development, and Surveillance."],
            ["The radii of the orbits correspond to the approximate ranges in kilometers: Lower Earth Orbit (LEO) < 2000km, Medium Earth Orbit (GEO) 2000-20,560km, and Geosynchronous Equatorial Orbit (GEO) <35,786km. To spread the satellites out in space and prevent overlap, each satellite was encoded with a random radius within its prescribed orbit range and a random starting angle. Satellites with elliptical orbits have been encoded with a regular orbit for animation purposes."],
            ["Unfortunately, our satellite dataset begins with one record in 1977 before jumping straight into the middle of the Exploration Age in 1988. However, there were 116 satellites launched during the Space Race Age, 564 satellites launched in the Exploration Age (35 not included in data) and 2,257 satellites so far during the Commercialization Age. Therefore, roughly 16 satellites were launched every year during the Exploration Age, and during the Commercialization Age that rate has jumped to roughly 250 satellites per year."]
            ]
        vis.originalTimePeriod = d3.extent(vis.satData, d=>d.Date)

        // Set up text area for satellite info
        vis.satelliteInfo = vis.svg2.append("g");

        vis.satelliteInfo.append("text")
            .attr("class","sat-info")
            .attr("id","sat-name")
            .attr("x",vis.marginLegend.left)
            .attr("y", (vis.heightLegend + vis.marginLegend.top + vis.marginLegend.bottom)*0.65)
            .text("Hover over satellites for info!");

        vis.satelliteInfo.append("text")
            .attr("class","sat-info")
            .attr("id","sat-country")
            .attr("x",vis.marginLegend.left)
            .attr("y", (vis.heightLegend + vis.marginLegend.top + vis.marginLegend.bottom) * 0.65 + 1*25)
            .text("");

        vis.satelliteInfo.append("text")
            .attr("class","sat-info")
            .attr("id","sat-purpose")
            .attr("x",vis.marginLegend.left)
            .attr("y", (vis.heightLegend + vis.marginLegend.top + vis.marginLegend.bottom) * 0.65 + 2*25)
            .text("");

        vis.satelliteInfo.append("text")
            .attr("class","sat-info")
            .attr("id","sat-alt")
            .attr("x",vis.marginLegend.left)
            .attr("y", (vis.heightLegend + vis.marginLegend.top + vis.marginLegend.bottom) * 0.65 + 3*25)
            .text("");

        vis.satelliteInfo.append("text")
            .attr("class","sat-info")
            .attr("id","sat-year")
            .attr("x",vis.marginLegend.left)
            .attr("y", (vis.heightLegend + vis.marginLegend.top + vis.marginLegend.bottom) * 0.65 + 4*25)
            .text("");

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
            .attr("opacity", 0.9)
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.globePath);

        // create legend item
        vis.legend = vis.svg2.append("g")
            .attr("class", "orbitLegend")

        // initialize legend data array
        vis.legendData = [];


        // draw the globe
        vis.globe = vis.svg.selectAll(".country")
            .data(vis.world);

        vis.countries = vis.globe
            .enter().append("path")
            .attr('class', 'country')
            .attr("fill", "green")
            .attr("opacity", 0.7)
            .merge(vis.globe)
            .attr("d", vis.globePath)

        // planet group
        vis.container = vis.svg.append("g")
            .attr("id", "orbit_container")
            .attr("transform", "translate(" + vis.x + "," + vis.y + ")");

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        vis.selectedSatCategory = selectedSatCategory;

        // ****************************************
        //             Satellites
        // ****************************************

        // filter out entries where Period is NaN - removes about 20
        vis.filteredData = vis.satData.filter((d, i) => {
            if (!isNaN(d.Period)) {
                return d
            }
        })
        //
        // vis.filteredData = vis.satData1.filter(d=>{
        //     return d.Date >= vis.timePeriodMin && d.Date <=vis.timePeriodMax;
        // })

        //set up filter by Date

        // set up color
        // set color based on selected Category
        // pull random sats

        // filter the data
        vis.filterData(vis.filteredData)


        vis.drawfirstCircles();
        vis.updateLegend();




    }

    updateLegend () {
        let vis = this;

        //set color scales based on selected category
        if (vis.selectedSatCategory == "default") {
            vis.color=d3.scaleOrdinal()
                .range(["#00ffd4"])
                .domain([3])
            vis.legendData=["Satellites"]

            vis.satellites.forEach((d,i)=>{
                // console.log(d)
                d.color=vis.color(d.r)
            })
            vis.orbitLegendText= vis.orbitLegendTextAll[0]

        }
        else if (vis.selectedSatCategory == "country") {
            vis.legendData = ["USA", "China", "Russia", "United Kingdom", "Japan", "Other", "Collaboration"]
            vis.color = d3.scaleOrdinal()
                .range(["#0a60b1", "#7431c4", "#9f0797", "#640345", "#800000", "#ee6666", "#66ee83"])
                .domain(vis.legendData)


            vis.satellites.forEach((d,i)=>{
                d.color=vis.color(d.Country)

            })
            vis.orbitLegendText= vis.orbitLegendTextAll[1]
        }
        else if (vis.selectedSatCategory == "purpose"){
            vis.legendData = ["Communications", "Earth Science", "Navigation", "Space Science", "Other"]
            vis.color = d3.scaleOrdinal()
                .range(["#ec0505", "#ff6a04", "#ffeb04", "#2cc601", "#12cee7"])
                .domain(vis.legendData)

            vis.satellites.forEach((d,i)=>{
                d.color=vis.color(d.Purpose)

            })
            vis.orbitLegendText= vis.orbitLegendTextAll[2]
        }
        else if (vis.selectedSatCategory == "orbit"){
            vis.legendData = ["LEO", "MEO", "GEO", "Elliptical"]
            vis.color = d3.scaleOrdinal()
                .range(["#1d6209", "#08e2b0", "#2f96e7", "#6230be" ])
                .domain(vis.legendData)

            vis.satellites.forEach((d,i)=>{
                d.color=vis.color(d.Orbit)

            })

            vis.orbitLegendText= vis.orbitLegendTextAll[3]
        }
        else if (vis.selectedSatCategory == "age"){
            vis.legendData = ["Space Race (1957-1975)", "Exploration (1976-2011)", "Commercialization (2012-Present)"]
            vis.color=d3.scaleOrdinal()
                .range(["#fa0202","#faf026", "#981af1"])
                .domain([vis.legendData])

            // console.log(vis.color("Space Race (1957-1974)"))

            vis.satellites.forEach((d,i)=>{
                d.color=vis.color(d.age)

            })

            vis.orbitLegendText = vis.orbitLegendTextAll[4]

        }

        // vis.displayData = vis.satellites;
        vis.updateColor()
    }

    drawfirstCircles() {
        let vis = this;

        // draw planets and moon clusters


        vis.circle = vis.container.selectAll("circle")
            .data(vis.satellites, d => d.name);

        let i = 0;

        vis.circle
            .enter()
            .append('circle')
            .attr("class", "planet")
            .merge(vis.circle)
            .attr("r", d=>d.r)
            .attr("cx", d=>d.R)
            .attr("cy", 0)
            .attr("stroke", "black")
            .style("stroke-width", 0.1)
            .attr("transform", function (d) {
                return "rotate(" + d.phi0 + ")";
            })
            .style("fill", d=>{i++; return d.color})
            .selection()
            .on("mouseover", function (event, d) {
                console.log(d)

                vis.satelliteInfo.select("#sat-name")
                    .style("font-weight", "bold")
                    .text("Name:  " + d.name);


                vis.satelliteInfo.select("#sat-country")
                    .text("Country:  " + d.Country2);

                vis.satelliteInfo.select("#sat-purpose")
                    .text("Purpose:  " + d.Purpose2);

                vis.satelliteInfo.select("#sat-alt")
                    .text("Orbit:  " + d.Orbit);

                vis.satelliteInfo.select("#sat-year")
                    .text("Launched:  " + d.year);
            });

        // exit
        vis.circle.exit().remove();

        // animate
        vis.animate = function (duration,angle_multiple) {
            vis.svg.selectAll(".planet")
                .transition()
                .ease(d3.easeLinear)
                .duration(duration)
                .attr("transform", function (d) {
                    d.phi0 = d.phi0 + Math.sqrt(1/d.R) * angle_multiple; // orbital period -> sqrt(1/R)
                    return "rotate(" + d.phi0 + ")";
                })

        }
    }

    updateColor() {
        let vis = this;

        // set up stuff for the labels
        vis.orbitLegendSquares = vis.legend
            .attr("class", "legendSquares")
            .selectAll(".legendSquare")
            .data(vis.legendData);

        vis.orbitLegendLabels = vis.legend
            .attr("class", "legendLabels")
            .selectAll(".legendLabel")
            .data(vis.legendData);


        vis.orbitBody = d3.select("#orbitLegendText").data(vis.orbitLegendText).attr("class", "orbitLegendText")

        var size = 20;

        // make the legend color squares
        let i = 0;
        vis.orbitLegendSquares
            .enter()
            .append("rect")
            .attr("class", "legendSquare")
            .merge(vis.orbitLegendSquares)
            .attr("x", 20)
            .attr("width", size)
            .attr("height", size)
            .transition().duration(1000)
            .attr("y", function (d, i) {
                return 25 + i * (size + 5)
            }) // 100 is where the first dot appears. 25 is the distance between dots

            .style("fill", function (d) {
                return vis.color(d)
            })
            ;

        // console.log(i)
        // make the legend text, colored the same
        vis.orbitLegendLabels
            .enter()
            .append("text")
            .attr("class", "legendLabel")
            .merge(vis.orbitLegendLabels)
            .attr("x", 60)
            .transition().duration(1000)
            .attr("y", function (d, i) {
                return 25 + i * (size + 5) + (size / 2)
            })

            .style("fill", function (d) {
                return vis.color(d)
            })
            .text(function (d) {
                if (vis.selectedSatCategory == "orbit") {
                    if (d == "LEO") {
                        return "Low Earth Orbit"
                    } else if (d=="MEO") {
                        return "Medium Earth Orbit"
                    } else if (d=="GEO"){
                        return "Geosynchronous Equatorial Orbit"
                    } else {
                        return "Elliptical Orbit"
                    }
                } else if (vis.selectedSatCategory == "default"){
                    return "Satellites"

        }
                else {
                    return d
                }
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

        //remove the current text box if there is one
        // vis.body.selectAll("p").remove();
        vis.orbitBody.enter().append("p").merge(vis.orbitBody).text(vis.orbitLegendText[0])

        // update legend stuffs
        vis.orbitLegendSquares.exit().remove();
        vis.orbitLegendLabels.exit().remove();
        vis.orbitBody.exit().remove();


        // draw planets and moon clusters
        vis.circle = vis.container.selectAll("circle")
            .data(vis.satellites, d => d.name);

        vis.circle.enter().append('circle')
            .attr("class", "planet")
            .merge(vis.circle)
            .style("fill", d=>d.color);



        // exit
        vis.circle.exit().remove();
    }

    filterData(){
        let vis = this;

        let pulledData = [];
        // console.log(vis.filteredData)

        for (let ii = 0; ii < vis.displayAmount; ii++) {
            pulledData.push(vis.filteredData[Math.floor(Math.random() * vis.filteredData.length)]);
        }

        vis.filteredData=pulledData

        vis.satellites = []

        vis.filteredData.forEach((d, i) => {
            // console.log(d)
            let speed = 0;
            let phi0 = 0;
            vis.R = 0;
            let r = 0;

            r = 2 //same size for all sats

            // radius of planet is 50. chose 55 to have a bit of a buffer
            // diameter of planet is 100 pixels, so the conversion is 0.0078px/km -> used to calculate pixel ranges
            // for each class of orbit, generate a random number within acceptable range
            // randomness will help spread them out in space, "jitter"

            if (d["Class of Orbit"] == "LEO") {
                //min radius possible is 52, max radius possible is 66
                vis.R = Math.floor(Math.random() * 16) + 55

            } else if (d["Class of Orbit"] == "MEO") {
                vis.R = Math.floor(Math.random() * 150) + 71

            } else if (d["Class of Orbit"] == "GEO" | d["Class of Orbit"] == "Elliptical") {
                vis.R = Math.floor(Math.random() * 124) + 216
            }

            let age;
            let dateParser = d3.timeParse("%m/%d/%Y");

            // console.log(d.Date)
            if (d.Date >= dateParser("01/01/1957") & d.Date <= dateParser("12/31/1975")){
                age = "Space Race (1957-1975)"
            } else if (d.Date >= dateParser("01/01/1976") & d.Date <= dateParser("12/31/2011")){
                age = "Exploration (1976-2011)"
            }
            else if (d.Date >= dateParser("01/01/2012") & d.Date <= dateParser("12/31/2020")){
                age = "Commercialization (2012-Present)"
            }


            // phi0 is the starting angle coordinate
            // make it random between 0 and 359 so they are spread out around the orbit
            phi0 = Math.floor(Math.random() * 360);

            vis.satellites.push({
                R: vis.R,
                r: 3,
                // speed: vis.periodScale(d.Period),
                phi0: phi0,
                name: d["Current Official Name of Satellite"],
                color: "#00ffd4",
                Country: d.Country,
                Country2: d["Country of Operator/Owner"],
                Purpose: d.Purpose,
                Purpose2: d.Purpose2,
                Users: d.Users,
                Orbit: d["Class of Orbit"],
                year: dateFormatter(d.Date),
                age: age
            })

        })


    }
}

