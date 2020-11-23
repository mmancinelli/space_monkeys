/*
* FlightVis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*/

class FlightVis {


    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
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

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .style("overflow", "visible");

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

        vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (vis.height) + ")")
            .call(vis.xAxis.tickFormat(d3.format("d")))

        vis.yAxis_Pointer = vis.svg.append("g")
            .attr("class", "axis y-axis");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        console.log(vis.data)

        //Filter data by Selected Country
        //vis.dataCountry = vis.data.filter(function(country) {return country.Country == "USA";});

        //vis.data=vis.dataCountry

        //console.log(vis.data)

        // Group data by Rocket_Category
        vis.filteredData = []
        vis.filteredData2 = []
        vis.dataByRocketCat = Array.from(d3.group(this.data, d =>d.Rocket_Category), ([key, value]) => ({key, value}))
        console.log(vis.dataByRocketCat)

        // Iterate, get total flights and years
        vis.dataByRocketCat.forEach(row => {
            vis.launchperyear = []
            vis.yearsinflight = []
            vis.years = d3.range(d3.min(row.value, d => d.date).getFullYear(),d3.max(row.value, d => d.date).getFullYear()+1);
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
            vis.filteredData[row.key] = {
            //vis.filteredData.push({
                rocket: row.key,
                total: row.value.length,
                years: vis.yearsinflight,
                flights: vis.launchperyear,
                cumsum: vis.cumsum,
                company: row.value[0].CompanyName,
                country: row.value[0].Country
            };
            vis.filteredData2.push({
                rocket: row.key,
                total: row.value.length,
                years: vis.yearsinflight,
                flights: vis.launchperyear,
                cumsum: vis.cumsum,
                company: row.value[0].CompanyName,
                country: row.value[0].Country
            });
        });

        console.log(vis.filteredData)

        vis.newData = []
        vis.newData.dates = d3.range(d3.min(vis.data,d=>d.date).getFullYear(), d3.max(vis.data,d=>d.date).getFullYear())
        // Reformat data
        //console.log(vis.newData)
        vis.series = []
        vis.series[0] = {
            name:  "Cosmos",
            values: d3.merge([Array(4).fill(0),vis.filteredData['Cosmos'].cumsum,Array(9).fill(0)])
        }
        vis.series[1] = {
            name:  "Molniya",
            values: d3.merge([Array(3).fill(0),vis.filteredData['Molniya'].cumsum,Array(11).fill(0)])
        }
        vis.series[2] = {
            name:  "Voskhod",
            values: d3.merge([Array(6).fill(0),vis.filteredData['Voskhod'].cumsum,Array(43).fill(0)])
        }
        vis.series[3] = {
            name:  "Tsyklon",
            values: d3.merge([Array(9).fill(0),vis.filteredData['Tsyklon'].cumsum,Array(15).fill(0)])
        }
        vis.series[4] = {
            name:  "Vostok",
            values: d3.merge([Array(1).fill(0),vis.filteredData['Vostok'].cumsum,Array(33).fill(0)])
        }
        vis.newData.series = vis.series;
        // Reformat data to make it like
        //console.log(vis.series)
        console.log(vis.newData);

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
        vis.yScale.domain([d3.min(vis.filteredData2,d=>d.total), d3.max(vis.filteredData2,d=>d.total)])

        vis.line = d3.line()
            .x((d,i) => vis.xScale(vis.newData.dates[i]))
            .y(d => vis.yScale(d));

        //let row = vis.filteredData[10];
        //console.log(row)
        //vis.dataRocket = []
        //row.years.forEach((jj,i) => {vis.dataRocket.push({year: row.years[i], flights: row.cumsum[i]});});

        //console.log(vis.dataRocket)

        vis.line_group = vis.svg.append("g")//.attr("class","path-group-jc");
                .attr("fill","none")
                .attr("stroke","white")
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .selectAll("path")//.append("path")//selectAll('path')
            .data(vis.newData.series)
            .join("path")
                .style("mix-blend-mode", "multiply")
                .attr("d", d => vis.line(d.values))
            //.enter()
            //.append("path")
            //.attr("class","test")
            //.attr("stroke","white")
            //.attr("fill","none")
            //.attr("d", d => vis.line(d.values));
            //.attr("d",  (d,i) => console.log(d));

        vis.yAxis_Pointer.call(vis.yAxis);
        vis.svg.call(vis.hover());
    }

    onSelectionChange(selectionStart, selectionEnd) {
        let vis = this;


        vis.wrangleData();
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
            .attr("r", 2.5);

        dot.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .attr("y", -8);

        function moved(event) {
            event.preventDefault();
            const pointer = d3.pointer(event, this);
            console.log(pointer)
            const xm = vis.xScale.invert(pointer[0]);
            const ym = vis.yScale.invert(pointer[1]);
            const i = d3.bisectCenter(vis.newData.dates, xm);
            const s = d3.least(vis.newData.series, d => Math.abs(d.values[i] - ym));
            vis.line_group.attr("stroke", d => d === s ? null : "#0e59a7").filter(d => d === s).raise();
            dot.attr("transform", `translate(${vis.xScale(vis.newData.dates[i])},${vis.yScale(s.values[i])})`);
            dot.select("text").text(s.name);
        }

        function entered() {
            vis.line_group.style("mix-blend-mode", null).attr("stroke", "#0e59a7");
            dot.attr("display", null);
        }

        function left() {
            vis.line_group.style("mix-blend-mode", "multiply").attr("stroke", null);
            dot.attr("display", "none");
        }
    }

}