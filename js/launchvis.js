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
        this.filteredData = [];

        // default countries
        this.myCountries = ["USA", "China", "Russia", "Japan", "Israel", "New Zealand", "Iran", "France", "India",
            "Mexico", "Kazakhstan", "North Korea", "Brazil", "Kenya", "Australia"]


        // convert to js Date object
        this.data.forEach(d => d.date = new Date(d.Datum));

        // condense country_list
        this.data.forEach(function (d) {
            if (d.Country === "Florida" | d.Country === "California" | d.Country === "Canaria") {
                d.Country = "USA";
                d.lat = 39.75;
                d.lon = -98.3;
            }
            if (d.Country === "Kazakhstan") {
                d.Country = "Russia";
                d.lat = 60;
                d.lon = 100;
            }
            if (d.Country === "North Korea") {
                d.lat = 43; // move up for rendering
            }
            // if (d.Country === "Japan") {
            //     d.lon = 142; // move over for rendering
            // }
        });

        // pull out the country names and exclude bad data
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        // make list of countries
        let countries = [];
        this.data.forEach(d => countries.push(d.Country));
        let unique_countries = countries.filter(onlyUnique);
        this.countries_list = unique_countries.filter(function (d) {
            return (d !== "Sea") && (d !== "Site") && (d  !== "Facility") && (d !== "Ocean")
        });


        // console.log("Unique Countries/States: " + this.countries_list)

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
            .text("Map of Launches")
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle')
            .attr('font-weight','bold')
            .attr('font-style','italic');

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
        vis.map_group = vis.svg.append("g").attr("id","map_group");
        vis.circle_group = vis.svg.append("g").attr("id","circle_group");
        vis.label_group = vis.svg.append("g").attr("id","circle_label_group");

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
            .offset([0, 0])
            .html(function(d) {
                return "<p>" + d.name + "</p><p>Launches: " + d.launches + "</p>";
            });
        vis.circle_group.call(vis.tooltip);

        // add listener to push button
        d3.select("#map_animation").on("click", function() {
            animateMap();
        });

        // add legend
        // create legend item
        vis.legend = vis.svg.append("g")
            .attr("class", "mapLegend")

        //vis.addLegend();

        // // (Filter, aggregate, modify data)
        // vis.wrangleData();
    }

    addLegend() {
        let vis = this;

        // create legend data
        vis.legendData = vis.myCountries

        // set up stuff for the labels
        vis.legendSquares = vis.legend
            .attr("class", "legendSquares")
            .selectAll(".legendSquare")
            .data(vis.legendData);

        vis.legendLabels = vis.legend
            .attr("class", "legendLabels")
            .selectAll(".legendLabel")
            .data(vis.legendData);

        let size = 20;

        // make the legend color squares
        vis.legendSquares
            .enter()
            .append("rect")
            .attr("class", "legendSquare")
            .merge(vis.legendSquares)
            .attr("x", 20)
            .attr("y", function (d, i) {
                return 10 + i * (size + 5)
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .style("fill", function (d) {
                return countryColorScale(d)
            });

        // make the legend text, colored the same
        vis.legendLabels
            .enter()
            .append("text")
            .attr("class", "legendLabel")
            .merge(vis.legendLabels)
            .attr("x", 60)
            .attr("y", function (d, i) {
                return 10 + i * (size + 5) + (size / 2)
            })
            .style("fill", function (d) {
                return countryColorScale(d)
            })
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

        // update legend stuffs
        vis.legendSquares.exit().remove();
        vis.legendLabels.exit().remove();
    }



    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // filter data on brushed range
        if (mapvis_selectedTime.length !== 0){
            vis.filteredData = vis.data.filter(function (d) {
                return (d.date.getFullYear() <= mapvis_selectedTime[1]) && (d.date.getFullYear() >= mapvis_selectedTime[0]);
            })
        } else {
            vis.filteredData = vis.data;
        }

        // create data
        vis.displayData = [];

        // count launches per country/state for filtered data
        vis.countries_list.forEach(function (c) {
            let country_data = vis.filteredData.filter(d => d.Country === c)

            let country_index = vis.data.findIndex(d => d.Country == c);

            vis.displayData.push( { name:     c,
                                    launches: country_data.length,
                                    lat:      vis.data[country_index].lat,
                                    lon:      vis.data[country_index].lon}
            );
        })

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
            .data(vis.displayData);

        // vis.label = vis.label_group.selectAll("text")
        //     .data(vis.displayData);

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
            .duration(100)
            .attr("id",d => ("circle-"+d.name).replace(/ /g,"_"))
            .attr("transform", d => `translate(${vis.projection([d.lon, d.lat])})`)
            .attr("r", d => Math.sqrt(d.launches))
            .attr("fill", "#428A8D")
            .attr("stroke", "#136D70");

        // vis.label.enter().append("text")
        //     .attr("class", "circle-label")
        //
        //     // Enter and Update (set the dynamic properties of the elements)
        //     .merge(vis.label)
        //     .on("mouseover", function (e,d) {
        //         vis.tooltip.show(d,this);
        //     })
        //     .on("mouseout", function (){
        //         vis.tooltip.hide();
        //     })
        //     .on("click", function (e,d) {
        //         console.log(d);
        //     })
        //     .transition()
        //     .duration(100)
        //     .text(d => d.launches)
        //     .attr('text-anchor', 'middle')
        //     .attr('alignment-baseline','middle')
        //     .attr('font-weight','bold')
        //     .attr('fill',d => countryColorScale(d.name))
        //     .attr('font-size','x-large')
        //     .attr('stroke','white')
        //     .attr('stroke-width',1)
        //     .attr("transform", d => `translate(${vis.projection([d.lon, d.lat])})`);


        // Exit
        vis.circle.exit().remove();
        // vis.label.exit().remove();

    }

}