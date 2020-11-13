/*
* LaunchVis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*/

class LaunchVis {


    constructor(_parentElement, _data, _geoData) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.geoData = _geoData;
        this.filteredData = this.data;

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .text("Launches per Country")
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // define scale factor
        vis.map_scale = 0.3;

        // define projection
        vis.projection = d3.geoNaturalEarth1()
            .translate([vis.width / 2, vis.height / 2])
            .scale(d3.min([vis.height * vis.map_scale, vis.width * vis.map_scale]));

        // define geo generator
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // convert topojson data to geojson
        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;

        // create map vis group and circle group
        vis.map_group = vis.svg.append("g");
        vis.circle_group = vis.svg.append("g");

        vis.map_group.append("path")
            .attr("id", "outline")
            .attr("fill","none")
            .attr("stroke","white")
            .attr("d", vis.path({type: "Sphere"}));

        // add graticule
        vis.map_group.append("path")
            .attr("d", vis.path(d3.geoGraticule10()))
            .attr("stroke", "#ddd")
            .attr("fill", "none");

        // draw countries
        vis.countries = vis.map_group.selectAll(".country")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'country')
            .attr('fill','white')
            .attr("d", vis.path);

        // append and call tooltip
        vis.tooltip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {
                return "<p>" + d.Country + "</p>";
            });
        vis.circle_group.call(vis.tooltip);

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // Update the visualization
        vis.updateVis();
    }



    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        // Data-join
        vis.circle = vis.circle_group.selectAll("circle")
            .data(vis.filteredData);

        // Enter (initialize the newly added elements)
        vis.circle.enter().append("circle")
            .attr("class", "circle")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.circle)
            .on("mouseover", function (e,d) {
                vis.tooltip.show(d,this);
            })
            .on("mouseout", function (){
                vis.tooltip.hide();
            })
            .on("click", function (e,d) {
                console.log(d);
            })
            .transition()
            .duration(200)
            .attr("transform", d => `translate(${vis.projection([d.lon, d.lat])})`)
            .attr("r", 14)
            .attr("fill", "black");


        // Exit
        vis.circle.exit().remove();



    }


    onSelectionChange(selectionStart, selectionEnd) {
        let vis = this;


        // Filter data depending on selected time period (brush)

        // *** TO-DO ***


        vis.wrangleData();
    }
}