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

        vis.xScale = d3.scaleTime()
            //.domain([d3.min(vis.data,d=>d.date), d3.max(vis.data,d=>d.date)])
            .domain(d3.extent(vis.data, d=> d.date))
            .range([vis.margin.left,vis.width-vis.margin.right]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)



        vis.yScale = d3.scaleLinear()
            .range([vis.height-vis.margin.top, vis.margin.bottom]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.yScale)

        vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (vis.height-vis.margin.bottom) + ")")
            .call(vis.xAxis)

        vis.yAxis_Pointer = vis.svg.append("g")
            .attr("class", "axis y-axis")
            .attr("transform", "translate(" + vis.margin.left + ",0)");

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
        vis.dataCountry = vis.data.filter(function(country) {return country.Country == "USA";});

        vis.data=vis.dataCountry

        console.log(vis.data)

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

        console.log(vis.filteredData)
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

       // function line { d3.line()
       //     .defined(d => !isNaN(d))
       //     .x((d, i) => x(data.dates[i]))
       //     .y(d => y(d)) }

        let row = vis.filteredData[10];
        console.log(row)
        vis.dataRocket = []
        row.years.forEach((jj,i) => {vis.dataRocket.push({year: row.years[i], flights: row.cumsum[i]});});

        console.log(vis.dataRocket)

        vis.svg.selectAll()
            .datum(vis.dataRocket)
            .append('path')
            .enter()
            .attr("d", d3.line()
                //.x(function(d) { return vis.xScale(d.year) })
                .x(function(d) { return vis.xScale(d.flights) })
                .y(function(d) { return vis.yScale(d.flights) })
            )
            .attr("stroke", "#e2efef")
            .style("stroke-width", 4)

        //vis.line = d3.line()
        //    .defined(d => !isNaN(d))
        //    .x((d, i) => console.log(d))
        //    .y(d => console.log(d))

        //vis.svg.selectAll("path")
        //    .data(vis.dataRocket)
        //    .join("path")
        //        .style("mix-blend-mode", "multiply")
        //        //.attr("d", d => console.log(d))
        //        .attr("d", d3.line()
        //           .x(d => vis.xScale(d.year))
        //            .y(d => vis.yScale(d.cumsum))
        //        )
        //    .attr("stroke", "#e2efef")
        //    .style("stroke-width", 4)
                //.attr("d", d => vis.line(d.years));


        console.log('JCL')
        //vis.svg.selectAll("path")
        //    .data([vis.dataRocket])
        //    //.join("path")
        //    //.style("mix-blend-mode", "multiply")
        //    .append('path')
        //    .enter()
        //    //.attr("d", d => line(d.values))
        //    .attr("d", d3.line()
        //        .x(function(d) { return console.log(d)})
        //       //.x(function(d) { console.log(d) return vis.xScale(d.year) })
        //        .y(function(d) { return vis.yScale(d.flights) }))
        //    .attr("stroke", "#e2efef")
        //    .style("stroke-width", 4)
        //    .style("fill", "none");

        ///vis.filteredData.forEach(row => {
        ///    //console.log(row)
        ///    vis.dataRocket = []
        ///    row.years.forEach((jj,i) => {vis.dataRocket.push({year: new Date(row.years[i]), flights: row.cumsum[i]});});
        ///    //console.log(vis.dataRocket)
        ///    //console.log(vis.xScale(vis.dataRocket.year))
        ///
        ///    vis.svg.selectAll()
        ///        .datum(vis.dataRocket)
        ///        .append('path')
        ///        .enter()
        ///        .attr("d", d3.line()
        ///            .x(function(d) { return vis.xScale(d.year) })
        ///            .y(function(d) { return vis.yScale(d.flights) })
        ///        )
        ///        .attr("stroke", "#e2efef")
        ///        .style("stroke-width", 4)
        ///        .style("fill", "none")
        ///});

        vis.yAxis_Pointer.call(vis.yAxis);
    }

    onSelectionChange(selectionStart, selectionEnd) {
        let vis = this;


        vis.wrangleData();
    }

}