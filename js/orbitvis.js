/*
 * Orbitvis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

class Orbitvis {


    constructor(_parentElement,  airportData, geoData) {
        this.parentElement = _parentElement;
        this.geoData = geoData;
        this.airportData = airportData;

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        // let vis = this;


        let vis = this;


        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        //draw globe
        vis.drawGlobe()




        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;

        // create random data structure with information for each land

        vis.updateVis()
    }



    updateVis() {
        let vis = this;



            // vis.countries

            //     .on('mouseover', function(event, d){
            //         d3.select(this)
            //             .attr('stroke-width', '2px')
            //             .attr('stroke', 'black')
            //             .attr('fill', 'purple')
            //
            //
            //         vis.tooltip
            //             .style("opacity", 1)
            //             .style("left", event.pageX + 20 + "px")
            //             .style("top", event.pageY + "px")
            //             // .text("Herllo ourt there")
            //             .html(`
            //                  <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
            //                      <h3>${d.properties.name}<h3>
            //                      <h4> Value: ${vis.countryInfo[d.properties.name].value}</h4>
            //                      <h4> Category: ${vis.countryInfo[d.properties.name].category}</h4>
            //
            //                  </div>`);
            //     })
            //     .on('mouseout', function(event, d){
            //         d3.select(this)
            //             .attr('stroke-width', '0px')
            //             .attr("fill", vis.countryInfo[d.properties.name].color)
            //
            //         vis.tooltip
            //             .style("opacity", 0)
            //             .style("left", 0)
            //             .style("top", 0)
            //             .html(``);
            //     });


    }

    drawGlobe() {
        let vis = this;
        vis.projection = d3.geoOrthographic()
            //d3.geoStereographic()//
            .scale(75)
            .translate([vis.width / 2, vis.height / 2])
        // .clipAngle(90);

        vis.path = d3.geoPath()
            .projection(vis.projection)
            .pointRadius(d => d.radius);

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;
        console.log(vis.world);


        // sphere
        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("opacity", 0.5)
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.path);


        //countries
        vis.countries = vis.svg.selectAll(".country")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .attr("fill", "green")
            .attr("opacity", 0.6);

        vis.config = {
            speed: 0.005,
            verticalTilt: -10,
            horizontalTilt: 0
        }
        d3.timer(function (elapsed) {
            vis.projection.rotate([vis.config.speed * elapsed - 120, vis.config.verticalTilt, vis.config.horizontalTilt]);
            vis.svg.selectAll("path").attr("d", vis.path);
            // drawMarkers();
        });
    }
}
