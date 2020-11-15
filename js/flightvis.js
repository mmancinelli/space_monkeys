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

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .text('Launches Over Time')
            .attr('transform', `translate(${vis.width/2}, 20)`)
            .attr('text-anchor', 'middle');

        // X-axis
        vis.xScale = d3.scaleTime()
            .domain([d3.min(vis.data,d=>d.date), d3.max(vis.data,d=>d.date)])
            .range([vis.margin.left,vis.width-vis.margin.right]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)

        vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (vis.height-vis.margin.bottom) + ")")
            .call(vis.xAxis)

        // Y-axis
        vis.yScale = d3.scaleLinear()
            .range([vis.height-vis.margin.top, vis.margin.bottom]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.yScale)

        vis.svg.append("g")
            .attr("class", "axis y-axis")
            .attr("transform", "translate(" + vis.margin.left + ",0)")
            .call(vis.yAxis)

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // Group data by Rocket_Category
        vis.filteredData = []
        vis.dataByRocketCat = Array.from(d3.group(this.data, d =>d.Rocket_Category), ([key, value]) => ({key, value}))

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
            });
            let y = 0
            vis.cumsum = vis.launchperyear.map(d=>y+=d)
            //vis.filteredData[row.key] =
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
        vis.yScale.domain([d3.min(vis.filteredData,d=>d.total), d3.max(vis.filteredData,d=>d.total)])

        vis.filteredData.forEach(row => {
            //console.log(row)
            vis.dataRocket = []
            row.years.forEach((jj,i) => {vis.dataRocket.push({year: row.years[i], flights: row.cumsum[i]});});
            //console.log(vis.dataRocket)
            //console.log(vis.xScale(vis.dataRocket.year))
            vis.svg.append('path')
                .datum(vis.dataRocket)
                .attr("d", d3.line()
                    .x(function(d) { return vis.xScale(d.year) })
                    .y(function(d) { return vis.yScale(d.flights) })
                )
                .attr("stroke", "#e2efef")
                .style("stroke-width", 4)
                .style("fill", "none")
        });

    }


    onSelectionChange(selectionStart, selectionEnd) {
        let vis = this;


        // Filter data depending on selected time period (brush)

        // *** TO-DO ***


        vis.wrangleData();
    }
}