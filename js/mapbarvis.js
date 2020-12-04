/*
* MapBarVis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*/

class MapBarVis {

    constructor(_parentElement, _data, _geoData) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.geoData = _geoData;
        this.filteredData = [];
        this.displayData = [];

        // default countries
        this.myCountries = ["USA", "China", "Russia", "Japan", "Israel", "New Zealand", "Iran", "France", "India",
            "Mexico", "North Korea", "South Korea", "Brazil", "Kenya", "Australia"]


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
            .attr('transform', `translate(${vis.width}, ${vis.height /2})`)
            .attr('text-anchor', 'end')
            .attr('font-weight','bold')
            .attr('font-style','italic');

        //create group for circles
        vis.square_group = vis.svg.append("g")
            .attr("class","rectangles")

        // add text group
        vis.text_group = vis.svg.append("g")
            .attr("class","rectangles-text")

        // add label group
        vis.label_group = vis.svg.append("g")
            .attr("class","rectangles-labels")

        //create scales
        vis.y = d3.scaleBand()
            .rangeRound([0, vis.height])
            .paddingInner(0.1)
            .domain(vis.myCountries);

        vis.x = d3.scaleLinear()
            .range([0 + vis.y.bandwidth(), vis.width - 100]) // leave room for labels
            .domain([0, 2100]); // scale with number of launches per country

        // count launches per country/state for filtered data
        vis.countries_list.forEach(function (c) {
            vis.displayData.push({
                    name: c,
                    launches: 0
                }
            );
        })

        // don't wrangle on init.
        vis.updateVis();
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

        // clear displayData
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
        vis.rectangles = vis.square_group.selectAll("rect")
            .data(vis.displayData);

        vis.labels = vis.label_group.selectAll("text")
            .data(vis.displayData);

        vis.texts = vis.text_group.selectAll("text")
            .data(vis.displayData);

        // Enter (initialize the newly added elements)
        vis.rectangles.enter().append("rect")
            .attr("class", "map-rectangle")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.rectangles)
            .on("mouseover", function (e,d) {
                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("fill","#ffb700");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("fill","#ffb700");

                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("stroke","#ffb700");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("stroke","#ffb700");
            })
            .on("mouseout", function (e,d) {
                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("fill","#00ffd4");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("fill","#00ffd4");

                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("stroke","#778899");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("stroke","#778899");
            })
            // .on("click", function (e,d) {
            //     console.log(d);
            // })
            .transition()
            .duration(100)
            .attr("id",d => ("rect-"+d.name).replace(/ /g,"_"))
            .attr("x",0)
            .attr("y",   d => vis.y(d.name))
            .attr("height", vis.y.bandwidth())
            .attr("width", d => vis.x(d.launches))
            .attr("fill","#00ffd4")
            .attr("stroke", "#778899")
            .attr('opacity',"80%");

        // Enter (initialize the newly added elements)
        vis.labels.enter().append("text")
            .attr("class", "legend-barmap")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.labels)
            .on("mouseover", function (e,d) {
                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("fill","#ffb700");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("fill","#ffb700");

                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("stroke","#ffb700");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("stroke","#ffb700");
            })
            .on("mouseout", function (e,d) {
                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("fill","#00ffd4");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("fill","#00ffd4");

                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("stroke","#778899");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("stroke","#778899");
            })
            .transition()
            .duration(100)
            .attr("alignment-baseline","middle")
            .attr("id",d => "label-"+d.name)
            .attr("x",d => vis.x(d.launches) + 10)
            .attr("y",   d => vis.y(d.name) + vis.y.bandwidth() / 2)
            .attr("fill","#ffffff")
            .text(d => d.name);

        // Enter (initialize the newly added elements)
        vis.texts.enter().append("text")
            .attr("class", "text-barmap")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.texts)
            .on("mouseover", function (e,d) {
                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("fill","#ffb700");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("fill","#ffb700");

                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("stroke","#ffb700");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("stroke","#ffb700");
            })
            .on("mouseout", function (e,d) {
                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("fill","#00ffd4");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("fill","#00ffd4");

                d3.select(("#rect-" + d.name).replace(/ /g,"_")).attr("stroke","#778899");
                d3.select(("#circle-" + d.name).replace(/ /g,"_")).attr("stroke","#778899");
            })
            .transition()
            .duration(100)
            .attr("alignment-baseline","middle")
            .attr("id",d => "text-"+d.name)
            .attr("x",d => 5)
            .attr("y",   d => vis.y(d.name) + vis.y.bandwidth() / 2)
            .attr("fill","#ffffff")
            .attr("font-style" ,"italic")
            .text(d => d.launches);

        // Exit
        vis.rectangles.exit().remove();
        vis.labels.exit().remove();
        vis.texts.exit().remove();

    }

}