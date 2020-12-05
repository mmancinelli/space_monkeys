/*
* FlightVis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*/

class FlightVis {


    constructor(_parentElement,_legendElement, _textElement, _data) {
        this.parentElement = _parentElement;
        this.legendElement = _legendElement;
        this.textElement = _textElement
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

        vis.svg3 = d3.select("#" + vis.textElement).append("svg")
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
            //.domain(d3.extent(vis.data, d=> d.date.getFullYear()))
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
            //.call(vis.xAxis.tickFormat(d3.format("d")))


        vis.yAxis_Pointer = vis.svg.append("g")
            .attr("class", "axis y-axis");

        vis.xAxis_Pointer = vis.svg.append("g")
            .attr("class", "axis x-axis");

        // Save master data
        vis.master = vis.data;
        vis.myCountries = ["USA", "China", "Russia", "Japan", "Israel", "New Zealand", "Iran", "France", "India", "Mexico", "Kazakhstan", "North Korea", "Brazil", "Kenya", "Australia"]
        //console.log(vis.master)

        // create legend item
        vis.legend = vis.svg2.append("g")
            .attr("class", "FlightLegend")

        vis.textbox = vis.svg3.append("g")
            .attr("class", "TextBox")

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
        vis.selectedAge = selectedSpaceAge;
        vis.factClick = clicks;

        // console.log(vis.factClick)
        //console.log(vis.selectedCountry);

        vis.legendTextAll=[
            ["The most emblematic rockets of the Space Race were the Cosmos from the Soviet Union, which delivered multiple Soviet satellites to space.  On the American side, the Saturn V was and still is the most powerful rocket ever built.  Although it did not have as many cumulative flights as the Cosmos, this rocket delivered Neil Armstrong and Buzz Aldrin to the surface of the Moon on 1969."],
            ["NASA's Space Shuttle became the first reusable vehicle.  Capable of launching like a rocket and landing like a plane, the Space Shuttle was one of the key rockets during the Exploration Era.  It had a total of 135 missions, taking astronauts and cargo to space.  It famously launched the Hubble Space Telescope, and constructed the International Space Station.  The Shuttle retired in 2011, marking the end of an era of exploration."],
            ["SpaceX's Falcon 9 delivered the first set of cargo to the International Space Station in 2012, marking the beginning of a new era led by the private sector.  The Falcon 9 developed new reusable booster technology with autonomous landing, dramatically reducing the cost of launching satellites and cargo to space.  The European launch provider , Arianepace, also increased the frequency of its rocket launches aboard the Ariane 5."],
            ["Use the options above and KEEP EXPLORING rockets by Country and Era!"]];

        if(vis.factClick >= 3){
            vis.legendText = vis.legendTextAll[3];
        }else{
            vis.legendText = vis.legendTextAll[vis.factClick];
        }

        vis.color = d3.scaleOrdinal()
            //.range(["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"])
            .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]);

        if (vis.selectedCountry === "default") {
            vis.data=vis.master;
            vis.legendData = vis.myCountries;
            vis.color = countryColorScale;
        }else if (vis.selectedCountry === "USA") {
            vis.legendData=["SpaceX","ULA","Northrop","Virgin Orbit","Blue Origin","NASA","Boeing","ILS","Lockheed","EER","General Dynamics","Martin Marietta","Douglas","US Air Force", "US Navy","AMBA"];
        }else if (vis.selectedCountry === "China") {
            vis.legendData=["CASC","ExPace","i-Space","OneSpace","Landspace","CASIC"];
        }else if (vis.selectedCountry === "Russia") {
            vis.legendData=["Roscosmos","VKS RF","Arianespace","ILS","Eurockot","Land Launch","Kosmotras","Khrunichev","Starsem","RVSN USSR","Yuzhmash","OKB-586"];
        }else if (vis.selectedCountry === "Japan") {
            vis.legendData=["JAXA","MHI","ISAS", "UT"];
        }else if (vis.selectedCountry === "Israel") {
            vis.legendData=["IAI"];
        }else if (vis.selectedCountry === "New Zealand") {
            vis.legendData=["Rocket Lab"];
        }else if (vis.selectedCountry === "Iran") {
            vis.legendData=["ISA"];
        }else if (vis.selectedCountry === "France") {
            vis.legendData=["Arianespace","Rocket Lab","VKS RF","Kosmotras","Boeing","AEB","ASI","Arm'e de l'Air"];
        }else if (vis.selectedCountry === "Mexico") {
            vis.legendData = ["Exos"];
        }else if (vis.selectedCountry === "Brazil") {
            vis.legendData = ["AEB"];
        }else if (vis.selectedCountry === "India") {
            vis.legendData = ["ISRO"];
        }

        vis.dataCountry = vis.master.filter(function (country) {return country.Country === vis.selectedCountry;});
        if(vis.selectedCountry === "default"){
            vis.data = vis.master
            vis.legendData = vis.myCountries;
            vis.color = countryColorScale;
        }else{
            vis.data = vis.dataCountry
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
            //vis.years = d3.range(d3.min(vis.master,d=>d.date).getFullYear(), d3.max(vis.master,d=>d.date).getFullYear())

            if(vis.factClick === 0){
                vis.years=d3.range(new Date (1957),new Date(1975))
            }else if(vis.factClick === 1){
                vis.years=d3.range(new Date (1976),new Date(2011))
            }else if(vis.factClick === 2){
                vis.years=d3.range(new Date (2012),new Date(2020))
            }else{
                if(vis.selectedAge === "space_race"){
                    vis.years=d3.range(new Date (1957),new Date(1975))
                }else if(vis.selectedAge === "exploration"){
                    vis.years=d3.range(new Date (1976),new Date(2011))
                }else if(vis.selectedAge === "commercial"){
                    vis.years=d3.range(new Date (2012),new Date(2020))
                }else{
                    vis.years = d3.range(d3.min(vis.master,d=>d.date).getFullYear(), d3.max(vis.master,d=>d.date).getFullYear())
                }
            };

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
            //console.log(vis.launchperyear)
            vis.cumsum = vis.launchperyear.map(d=>y+=d)
            //console.log(vis.cumsum.length)
            var i = 0
            while (i < vis.cumsum.length) {
                //console.log(i)
                if(vis.cumsum[i] === vis.cumsum[vis.cumsum.length - 1]){
                    vis.cumsum[i] = null
                }
                else{
                    vis.cumsum[i] = vis.cumsum[i]
                }
                i = i + 1;
            }
            //console.log(vis.cumsum)
            //console.log(vis.cumsum)
            //vis.filteredData[row.key] = {
            vis.filteredData.push({
                rocket: row.key,
                total: d3.max(vis.cumsum),
                years: vis.yearsinflight,
                flights: vis.launchperyear,
                cumsum: vis.cumsum,
                company: row.value[0].CompanyName,
                country: row.value[0].Country
            });
        });

        //console.log(vis.filteredData)

        vis.newData = []
        //vis.newData.dates = d3.range(d3.min(vis.master,d=>d.date).getFullYear(), d3.max(vis.master,d=>d.date).getFullYear())
        vis.newData.dates = d3.range(d3.min(vis.years),d3.max(vis.years))
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

        // console.log(vis.newData);

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

        // console.log(vis.newData)

        vis.xScale.domain(d3.extent(vis.newData.dates))

        vis.yScale.domain([0, d3.max(vis.filteredData,d=>d.total)])

        vis.line = d3.line()
            .y(d => vis.yScale(d))
            //.defined(function(d) { return d; })
            .defined(function(d) { return d != null; })
            .x((d,i) => vis.xScale(vis.newData.dates[i]));

        vis.line_group = vis.svg.selectAll(".rockets")
            .data(vis.newData.series)

        vis.line_group.exit().remove()

        vis.rockettext = vis.svg.selectAll(".rockettext")//append("g")
            .data(vis.newData.series);

        vis.rockettext.exit().remove()

        vis.dot2 = vis.svg.append("g")
            .data(vis.newData.series)
            //.attr("display", "none");

        vis.dot2.append("circle")
            .attr("r", 5);

        vis.dot2.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .attr("text-anchor", "middle")
            .attr("y", -8);

        //vis.rocket.attr("transform", `translate(${vis.xScale(vis.newData.dates[i])},${vis.yScale(s.values[i])})`);
        //vis.rocket.select("text").text([s.name,s.company,ym.toFixed(0)]);

        if(vis.factClick>=3){
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
        } else{
            vis.line_group.enter().insert("g", ".focus").append("path")
                .attr("class","lines rockets")
                .attr("fill", "none")
                .attr("stroke-width", 3)
                .merge(vis.line_group)
                .transition().duration(1000)
                //.style("mix-blend-mode", "multiply")
                .attr("d", d => vis.line(d.values))
                .attr("stroke", d => {
                    if (d.name === "Saturn V" || d.name === "Cosmos" || d.name === "Space Shuttle" || d.name === "Falcon 9" || d.name === "Ariane 5") {
                        return "white"
                    }else {
                        return "blue"
                    }});
        }

        /*vis.line_group.enter().insert("g", ".focus").append("path")
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
                }});*/

        vis.line_group.style("mix-blend-mode", "multiply")

        if(vis.factClick<3){
            vis.hover2()
        }


        vis.legendSquares = vis.legend
            .attr("class", "legendSquares")
            .selectAll(".legendSquare")
            .data(vis.legendData);

        vis.legendLabels = vis.legend
            .attr("class", "legendLabels")
            .selectAll(".legendLabel")
            .data(vis.legendData);

        vis.body = d3.select("#legendText")

        vis.body2 = d3.select("#FlightText").data(vis.legendText).attr("class", "networkLegendText")
        vis.body2.enter().append("p").merge(vis.body2).text(vis.legendText[0])

        var size = 20;

        if(vis.factClick >=3){
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

            // update legend stuffs
            vis.legendSquares.exit().remove();
            vis.legendLabels.exit().remove();

            vis.hover()
        }

        //remove the current text box if there is one
        vis.body.selectAll("p").remove();

        // add new text info
        //vis.body.append("p").text(vis.legendText[0])

        vis.yAxis_Pointer.call(vis.yAxis);
        vis.xAxis_Pointer.attr("transform", "translate(0," + (vis.height) + ")")
            .call(vis.xAxis.tickFormat(d3.format("d")));

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
            /*dot.select("text").html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <p> <strong>Name: </strong>${s.name}</p>
                         <p> <strong>Company: </strong>${s.company}</p>
                         <p> <strong>Year: </strong>${vis.newData.dates[i]}</p>
                         <p> <strong>Flight: </strong>${ym.toFixed(0)}</p>              
                     </div>`);*/
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

    hover2() {

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
                    return "#ffb700"
                }else {
                    return "blue"
                }}).filter(d => d === s).raise();
            dot.attr("transform", `translate(${vis.xScale(vis.newData.dates[i])},${vis.yScale(s.values[i])})`);
            dot.select("text").text(s.name);
        }

        function entered() {
            //vis.line_group.style("mix-blend-mode", null).attr("stroke", "#0e59a7");
            vis.line_group.attr("stroke","#ffb700")
            dot.attr("display", null);
        }

        function left() {
            //vis.line_group.style("mix-blend-mode", "multiply").attr("stroke", null);
            //vis.line_group.attr("stroke","#ecf1f5")
            vis.line_group.attr("stroke", d => {
                if (d.name === "Saturn V" || d.name === "Cosmos" || d.name === "Space Shuttle" || d.name === "Falcon 9" || d.name === "Ariane 5") {
                    return "white"
                }else {
                    return "blue"
                }})
            dot.attr("display", "none");
        }
    }

}