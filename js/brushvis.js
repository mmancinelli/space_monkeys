/*
* Brushvis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*/

class Brushvis {


    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];

        // convert to js Date object
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

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // clip path
        vis.clip_path = vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip-brush")
            .append("rect");

        vis.clip_path
            .attr("width", 0) // start hidden
            .attr("height", vis.height);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .text('Launches Over Time')
            .attr('transform', `translate(${vis.width/2}, 20)`)
            .attr('text-anchor', 'middle');

        // init scales
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // init pathGroup
        vis.pathGroup = vis.svg.append('g').attr('class','pathGroup');

        // init path
        vis.path = vis.pathGroup
            .append('path')
            .attr("class", "launch-plot");

        // init path generator
        vis.area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return vis.x(d.year); })
            .y0(vis.y(0))
            .y1(function(d) { return vis.y(d.launches); });

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis y-axis");

        // init brushGroup:
        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush");

        // add age labels
        vis.brushGroup.append("text")
            .attr("class","age-label")
            .attr("x",vis.width * 0.1856)
            .attr("y", vis.height * 3 / 4)
            .text("Space Race")
        vis.brushGroup.append("text")
            .attr("class","age-label")
            .attr("x",vis.width * 0.546)
            .attr("y", vis.height * 3 / 4)
            .text("Exploration Age")
        vis.brushGroup.append("text")
            .attr("class","age-label")
            .attr("x",vis.width * 0.901)
            .attr("y", vis.height * 3 / 4)
            .text("Comm. Age")

        //init brush
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush", function(event){
                mapvis_selectedTime = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];
                console.log(mapvis_selectedTime);
                launchVis.wrangleData(); // connection is made here through the use of global variables.
                mapBarVis.wrangleData();
            })
            .on("end", function (event) {
                if (event.selection === null) {
                    mapvis_selectedTime = [];
                    console.log("Selection Cleared");
                    launchVis.wrangleData(); // connection is made here through the use of global variables
                    mapBarVis.wrangleData();
                }
            });

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // count launches by year
        let years = d3.range(d3.min(vis.data, d => d.date).getFullYear(),d3.max(vis.data, d => d.date).getFullYear());
        years.forEach(function (y) {
            let launches_in_year = vis.data.filter(function (d) {
                return (d.date.getFullYear() == y)
            });
            vis.displayData.push({year: y, launches: launches_in_year.length})
        });

        // Update the visualization
        vis.updateVis();
    }



    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        // update domains
        vis.x.domain( d3.extent(vis.displayData, function(d) { return d.year }) );
        vis.y.domain( d3.extent(vis.displayData, function(d) { return d.launches }) );

        // draw path
        vis.path.datum(vis.displayData)
            .transition().duration(400)
            .attr("d", vis.area)
            .attr("fill", "#428A8D")
            .attr("stroke", "#136D70")
            .attr("clip-path", "url(#clip-brush)");

        // call brush
        vis.brushGroup
            .call(vis.brush);

        // draw x & y axis
        vis.xAxis.call(d3.axisBottom(vis.x)
            .tickFormat(d3.format("d"))
            .ticks(15)
        );
        vis.yAxis.call(d3.axisLeft(vis.y));


    }
}