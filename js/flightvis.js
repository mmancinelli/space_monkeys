/*
* FlightVis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*/

class FlightVis {


    constructor(_parentElement,_legendElement, _data) {
        this.parentElement = _parentElement;
        this.legendElement = _legendElement;
        this.data = _data[0];

        this.data.forEach(d => d.date = new Date(d.Datum));
        this.initVis();
    }
    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 50, bottom: 20, left: 50};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.marginLegend = {top: 0, right: 0, bottom: 100, left: 0};
        vis.widthLegend = $("#" + vis.legendElement).width() - vis.marginLegend.left - vis.marginLegend.right;
        vis.heightLegend = $("#" + vis.legendElement).height() - vis.marginLegend.top - vis.marginLegend.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .style("overflow", "visible");

        vis.svg2 = d3.select("#" + vis.legendElement).append("svg")
            .attr("width", vis.widthLegend + vis.marginLegend.left + vis.marginLegend.right)
            .attr("height", vis.heightLegend + vis.marginLegend.top + vis.marginLegend.bottom)
            .append('g')

        vis.svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")

        vis.xScale = d3.scaleLinear()
            //.domain([d3.min(vis.data,d=>d.date), d3.max(vis.data,d=>d.date)])
            .domain(d3.extent(vis.data, d=> d.date.getFullYear()))
            .range([0,vis.width]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale);

        vis.yScale = d3.scaleLinear()
        //vis.yScale = d3.scaleLog()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.yScale)

        vis.svg.append("text")
            //.attr("transform", "rotate(-90)")
            .attr("y",-5)
            .attr("x",20)
            .attr("dy", "1em")
            .style("text-anchor", "left")
            .text("Cumulative Flights");

        vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (vis.height) + ")")
            .call(vis.xAxis.tickFormat(d3.format("d")))


        vis.yAxis_Pointer = vis.svg.append("g")
            .attr("class", "axis y-axis");

        // Save master data
        vis.master = vis.data;
        vis.myCountries = ["USA", "China", "Russia", "Japan", "Israel", "New Zealand", "Iran", "France", "India", "Mexico", "Kazakhstan", "North Korea", "Brazil", "Kenya", "Australia"]
        //console.log(vis.master)

        // create legend item
        vis.legend = vis.svg2.append("g")
            .attr("class", "FlightLegend")

        vis.legendData = [];

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        vis.selectedCountry = selectedCountry;
        //console.log(vis.selectedCountry);

        vis.color = d3.scaleOrdinal()
            //.range(["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"])
            .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]);

        if (vis.selectedCountry === "default") {
            vis.data=vis.master;
            vis.legendData=vis.myCountries;
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "USA") {
            vis.dataCountry = vis.master.filter(function (country) {return country.Country === "USA";});
            vis.data = vis.dataCountry
            //vis.databyCompany = Array.from(d3.group(this.data, d =>d.CompanyName), ([key, value]) => ({key, value}))
            //console.log(vis.databyCompany)
            vis.legendData=["SpaceX","ULA","Northrop","Virgin Orbit","Blue Origin","NASA","Boeing","ILS","Lockheed","EER","General Dynamics","Martin Marietta","Douglas","US Air Force", "US Navy","AMBA"];
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "China") {
            vis.dataCountry = vis.master.filter(function (country) {return country.Country === "China";});
            vis.data = vis.dataCountry
            vis.legendData=["CASC","ExPace","i-Space","OneSpace","Landspace","CASIC"];
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "Russia") {
            vis.dataCountry = vis.master.filter(function (country) {return country.Country === "Russia";});
            vis.data = vis.dataCountry
            vis.legendData=["Roscosmos","VKS RF","Arianespace","ILS","Eurockot","Land Launch","Kosmotras","Khrunichev","Starsem","RVSN USSR","Yuzhmash","OKB-586"];
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "Japan") {
            vis.dataCountry = vis.master.filter(function (country) {return country.Country === "Japan";});
            vis.data = vis.dataCountry
            vis.legendData=["JAXA","MHI","ISAS", "UT"];
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "Israel") {
            vis.dataCountry = vis.master.filter(function (country) {return country.Country === "Israel";});
            vis.data = vis.dataCountry
            vis.legendData=["IAI"];
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "New Zealand") {
            vis.dataCountry = vis.master.filter(function (country) {return country.Country === "New Zealand";});
            vis.data = vis.dataCountry
            vis.databyCompany = Array.from(d3.group(this.data, d =>d.CompanyName), ([key, value]) => ({key, value}))
            vis.legendData=["Rocket Lab"];
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "Iran") {
            vis.dataCountry = vis.master.filter(function (country) {return country.Country === "Iran";});
            vis.data = vis.dataCountry
            vis.databyCompany = Array.from(d3.group(this.data, d =>d.CompanyName), ([key, value]) => ({key, value}))
            vis.legendData=["ISA"];
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "France") {
            vis.dataCountry = vis.master.filter(function (country) {return country.Country === "France";});
            vis.data = vis.dataCountry
            vis.databyCompany = Array.from(d3.group(this.data, d =>d.CompanyName), ([key, value]) => ({key, value}))
            vis.legendData=["Arianespace","Rocket Lab","VKS RF","Kosmotras","Boeing","AEB","ASI","Arm'e de l'Air"];
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "Mexico") {
            vis.dataCountry = vis.master.filter(function (country) {
                return country.Country === "Mexico";
            });
            vis.data = vis.dataCountry
            vis.databyCompany = Array.from(d3.group(this.data, d => d.CompanyName), ([key, value]) => ({key, value}))
            vis.legendData = ["Exos"];
            vis.color.domain(vis.legendData)
        }else if (vis.selectedCountry === "Brazil") {
            vis.dataCountry = vis.master.filter(function (country) {
                return country.Country === "Brazil";
            });
            vis.data = vis.dataCountry
            vis.databyCompany = Array.from(d3.group(this.data, d => d.CompanyName), ([key, value]) => ({key, value}))
            vis.legendData = ["AEB"];
            vis.color.domain(vis.legendData)
        }

        //console.log(vis.data)

        //Filter data by Selected Country
        //vis.dataCountry = vis.data.filter(function(country) {return country.Country == "USA";});

        //vis.data=vis.dataCountry

        //console.log(vis.data)

        // Group data by Rocket_Category
        vis.filteredData = []
        vis.dataByRocketCat = Array.from(d3.group(this.data, d =>d.Rocket_Category), ([key, value]) => ({key, value}))
        //console.log(vis.dataByRocketCat)

        // Iterate, get total flights and years
        vis.dataByRocketCat.forEach(row => {
            vis.launchperyear = []
            vis.yearsinflight = []
            //vis.years = d3.range(d3.min(row.value, d => d.date).getFullYear(),d3.max(row.value, d => d.date).getFullYear()+1);
            vis.years = d3.range(d3.min(vis.master,d=>d.date).getFullYear(), d3.max(vis.master,d=>d.date).getFullYear())
            vis.years.forEach(function (y) {
                vis.launch_year = row.value.filter(function (d) { return (d.date.getFullYear() == y) });
                if(vis.launch_year.length > 0 ){
                    vis.launchperyear.push(vis.launch_year.length)
                    vis.yearsinflight.push(y)
                }
                else{
                    vis.launchperyear.push(0)
                    vis.yearsinflight.push(y)
                }
            });
            let y = 0
            vis.cumsum = vis.launchperyear.map(d=>y+=d)
            //vis.filteredData[row.key] = {
            vis.filteredData.push({
                rocket: row.key,
                total: row.value.length,
                years: vis.yearsinflight,
                flights: vis.launchperyear,
                cumsum: vis.cumsum,
                company: row.value[0].CompanyName,
                country: row.value[0].Country
            });
        });

        //console.log(vis.filteredData)

        vis.newData = []
        vis.newData.dates = d3.range(d3.min(vis.master,d=>d.date).getFullYear(), d3.max(vis.master,d=>d.date).getFullYear())
        // Reformat data
        vis.series2 = []
        vis.filteredData.forEach(row => {
            vis.series2.push({
                name: row.rocket,
                country: row.country,
                company: row.company,
                values: row.cumsum
            })
        });

        vis.newData.series = vis.series2;

        //console.log(vis.series2)

        //console.log(vis.newData);

        //console.log(vis.filteredData)
        //console.log(vis.dataByRocketCat)

        // Update the visualization
        vis.updateVis();

    }



    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        //console.log(vis.filteredData)
        //console.log(d3.max(vis.newData.series,d => d.values))
        //vis.xScale.domain(d3.extent(vis.filteredData, d=> d.date.getFullYear()))
        //vis.yScale.domain([d3.min(vis.filteredData,d=>d.total), d3.max(vis.filteredData,d=>d.total)])
        vis.yScale.domain([0, d3.max(vis.filteredData,d=>d.total)])
        //vis.yScale.domain(d3.extent(vis.filteredData, d=> d.total))
        //vis.yScale.domain([d3.min(vis.filteredData,d=>d.total), 300])

        vis.line = d3.line()
            .x((d,i) => vis.xScale(vis.newData.dates[i]))
            .y(d => vis.yScale(d));

        //let row = vis.filteredData[10];
        //console.log(row)
        //vis.dataRocket = []
        //row.years.forEach((jj,i) => {vis.dataRocket.push({year: row.years[i], flights: row.cumsum[i]});});

        //console.log(vis.dataRocket)

        //vis.color = d3.scaleSqrt()
        //    .interpolate(() => d3.interpolateYlGnBu)
        //    .domain
       // vis.svg.selectAll(".line").remove()

        //vis.svg.select("g").selectAll("path").remove()

        // vis.line_group = vis.svg.append("g")
        //         .attr("fill","none")
        //         .attr("stroke","white")
        //         .attr("stroke-width", 5)
        //         .attr("stroke-linejoin", "round")
        //         .attr("stroke-linecap", "round")
        //         .selectAll("path")
        //     .data(vis.newData.series)
        //     .join("path")
        //
        // vis.line_group
        //     .style("mix-blend-mode", "multiply")
        //     .attr("d", d => vis.line(d.values))

        vis.line_group = vis.svg.selectAll(".rockets")
            .data(vis.newData.series)

        vis.line_group.exit().remove()

        vis.line_group.enter().insert("g", ".focus").append("path")
            .attr("class","lines rockets")
            .attr("fill", "none")
            .attr("stroke-width", 3)
            .merge(vis.line_group)
        .transition().duration(1000)
            //.style("mix-blend-mode", "multiply")
            .attr("d", d => vis.line(d.values))
            .attr("stroke", d => {
                if (vis.selectedCountry === "default") {
                    return vis.color(d.country)
                }else {
                    return vis.color(d.company)
                }});

        vis.line_group.style("mix-blend-mode", "multiply")

        vis.legendSquares = vis.legend
            .attr("class", "legendSquares")
            .selectAll(".legendSquare")
            .data(vis.legendData);

        vis.legendLabels = vis.legend
            .attr("class", "legendLabels")
            .selectAll(".legendLabel")
            .data(vis.legendData);

        vis.body = d3.select("#legendText")

        var size = 20;

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
            .text(d => d);

        //remove the current text box if there is one
        vis.body.selectAll("p").remove();

        // add new text info
        //vis.body.append("p").text(vis.legendText[0])

        // update legend stuffs
        vis.legendSquares.exit().remove();
        vis.legendLabels.exit().remove();

        // vis.lines = vis.svg.selectAll("linesGroup")
        //     .data(vis.newData.series)
        //
        // vis.linesGroup = vis.lines
        //     .enter()
        //     .append("g")
        //     .attr("class", (d,i) => 'linesGroup')
        //     .merge(vis.lines)
        //     .attr("d", d => vis.line(d.values))

        //vis.line_group
            //.join("path")
              //  .style("mix-blend-mode", "multiply")
                //.attr("d", d => vis.line(d.values))


        vis.yAxis_Pointer.call(vis.yAxis);

        vis.hover()
        //vis.mouseflight()

    }

    hover() {

        let vis = this;

        if ("ontouchstart" in document) vis.svg
            .style("-webkit-tap-highlight-color", "transparent")
            .on("touchmove", moved)
            .on("touchstart", entered)
            .on("touchend", left)
        else vis.svg
            .on("mousemove", moved)
            .on("mouseenter", entered)
            .on("mouseleave", left);

        const dot = vis.svg.append("g")
            .attr("display", "none");

        dot.append("circle")
            .attr("r", 5);

        dot.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .attr("text-anchor", "middle")
            .attr("y", -8);

        function moved(event) {
            event.preventDefault();
            const pointer = d3.pointer(event, this);
            //console.log(pointer)
            const xm = vis.xScale.invert(pointer[0]);
            const ym = vis.yScale.invert(pointer[1]);
            const i = d3.bisectCenter(vis.newData.dates, xm);
            //console.log(xm)
            //console.log(ym)
            //console.log(i)
            const s = d3.least(vis.newData.series, d => Math.abs(d.values[i] - ym));
            //vis.line_group.attr("stroke", d => d === s ? null : "#ecf1f5").filter(d => d === s).raise();
            //vis.line_group.attr("stroke","#ecf1f5")
            vis.line_group.attr("stroke", d => {
                    if (d === s) {
                        return "#ecf1f5"
                    }else {
                        return "#184264"
                    }}).filter(d => d === s).raise();
            dot.attr("transform", `translate(${vis.xScale(vis.newData.dates[i])},${vis.yScale(s.values[i])})`);
            dot.select("text").text([s.name,s.company,ym.toFixed(0)]);
        }

        function entered() {
            //vis.line_group.style("mix-blend-mode", null).attr("stroke", "#0e59a7");
            vis.line_group.attr("stroke","#ecf1f5")
            dot.attr("display", null);
        }

        function left() {
            //vis.line_group.style("mix-blend-mode", "multiply").attr("stroke", null);
            //vis.line_group.attr("stroke","#ecf1f5")
            vis.line_group.attr("stroke", d => {
                if (vis.selectedCountry === "default") {
                    return vis.color(d.country)
                }else {
                    return vis.color(d.company)
                }});
            dot.attr("display", "none");
        }
    }

    mouseflight(){
            let vis = this;

            vis.mouseG = vis.svg.append("g")
                .attr("class", "mouse-over-effects");

            vis.mouseG.append("path") // this is the black vertical line to follow mouse
                .attr("class", "mouse-line")
                .style("stroke", "black")
                .style("stroke-width", "1px")
                .style("opacity", "0");

            vis.lines = document.getElementsByClassName("lines rockets");
            //console.log(vis.lines)

            vis.mousePerLine = vis.mouseG.selectAll('.mouse-per-line')
                .data(vis.newData.series)
                .enter()
                .append("g")
                .attr("class", "mouse-per-line");

            vis.mousePerLine.append("circle")
                .attr("r", 7)
                .style("stroke", d => {
                    if (vis.selectedCountry === "default") {
                        return vis.color(d.country)
                    }else {
                        return vis.color(d.company)
                    }})
                .style("fill", "none")
                .style("stroke-width", "1px")
                .style("opacity", "0");

           vis.mousePerLine.append("text")
                .attr("transform", "translate(10,3)");

            vis.mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
                .attr('width', vis.width) // can't catch mouse events on a g element
                .attr('height', vis.height)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .on('mouseout', function() { // on mouse out hide line, circles and text
                    d3.select(".mouse-line")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line text")
                        .style("opacity", "0");
                })
                .on('mouseover', function() { // on mouse in show line, circles and text
                    d3.select(".mouse-line")
                        .style("opacity", "1");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "1");
                    d3.selectAll(".mouse-per-line text")
                        .style("opacity", "1");
                })
                .on('mousemove', function() { // mouse moving over canvas
                    vis.mouse = d3.pointer(event, this);
                    //console.log(vis.mouse[0])
                    d3.select(".mouse-line")
                        .attr("d", function() {
                            var d = "M" + vis.mouse[0] + "," + vis.height;
                            d += " " + vis.mouse[0] + "," + 0;
                            return d;
                        });

                    d3.selectAll(".mouse-per-line")
                        .attr("transform", function(d, i) {
                            //console.log(vis.width/vis.mouse[0])
                            var xDate = vis.xScale.invert(vis.mouse[0]);
                            //console.log(xDate)
                            //var bisect = d3.bisector(function(d) { return d.date; }).right;
                            var idx = d3.bisectCenter(vis.newData.dates, xDate)
                            //console.log(idx);
                            //var idx = bisect(d.values, xDate);

                            var beginning = 0,
                                end = vis.lines[i].getTotalLength(),
                                target = null;

                            while (true){
                                target = Math.floor((beginning + end) / 2);
                                vis.pos = vis.lines[i].getPointAtLength(target);
                                if ((target === end || target === beginning) && vis.pos.x !== vis.mouse[0]) {
                                    break;
                                }
                                if (vis.pos.x > vis.mouse[0])      end = target;
                                else if (vis.pos.x < vis.mouse[0]) beginning = target;
                                else break; //position found
                            }
                            const pointer = d3.pointer(event, this);
                            //console.log(pointer)
                            const xm = vis.xScale.invert(pointer[0]);
                            const ym = vis.yScale.invert(pointer[1]);
                            const ii = d3.bisectCenter(vis.newData.dates, xm);
                            const s = d3.least(vis.newData.series, d => Math.abs(d.values[ii] - ym));

                            console.log(vis.pos.y)

                            d3.select(this).select('text')
                                .text(vis.yScale.invert(vis.pos.y).toFixed(2));
                                //.text([s.name,s.company]);

                            return "translate(" + vis.mouse[0] + "," + vis.pos.y +")";
                        });
                });
        }

}