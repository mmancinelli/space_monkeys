/*
 * Orbitvis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 *
 * author: Zane
 * date started: 11/19/2020
 * date last modified: 11/20/2020
 */

class OrbitvisREDO {


    constructor(_parentElement, satelliteData, geoData) {
        this.parentElement = _parentElement;
        this.geoData = geoData;
        this.satData = satelliteData;

        // console.log(this.satData)

        this.initVis();
    }


/*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        // let vis = this;


        let vis = this;


        // vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        // vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        // vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.width = window.innerWidth
        vis.height = window.innerHeight;
        vis.svg=d3.select('#canvas')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('viewBox', `${-vis.width/2} ${-vis.height/2} ${vis.width} ${vis.height}`);
        //
        // // init drawing area
        // vis.svg = d3.select("#" + vis.parentElement)
        //     .attr("width", vis.width)
        //     .attr("height", vis.height)
        //     .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // ****************************************
        //             GLOBE
        // ****************************************

        //draw globe
        vis.projection = d3.geoOrthographic()
            //d3.geoStereographic()//
            .scale(50)
            .translate([0, 0])
        // .clipAngle(90);

        vis.globePath = d3.geoPath()
            .projection(vis.projection)
            .pointRadius(d => d.radius);

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;

        // sphere
        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("opacity", 0.5)
            .attr("stroke", "rgba(129,129,129,0.35)")
            .attr("d", vis.globePath);

        // config variables for rotation
        vis.config = {
            speed: 0.5,
            verticalTilt: -30,
            horizontalTilt: 0
        }

        //
        // vis.center = d3.select("#canvas").append("circle")
        //     .attr("r", "50")
        //     .attr("cx", "0")
        //     .attr("cy", "0")
        //     .attr("class", "center")
        //     .attr("fill", "none")



        const attractionForce = 0.0001; // Regulates orbitting velocity



        vis.particle = vis.svg.append("circle")
            .attr("r", "8")
            .attr("cx", "0")
            .attr("cy", "0")
            .attr("class", "particle")
        vis.particle2 = vis.svg.append("circle")
            .attr("r", "8")
            .attr("cx", "0")
            .attr("cy", "0")
            .attr("class", "particle")



        var particle = { id: vis.particle, id2: vis.particle2 };
        d3.forceSimulation()
            .alphaDecay(0)
            .velocityDecay(0)
            .nodes([particle])
            // Pull towards center with weak force
            .force("centerX", d3.forceX().strength(attractionForce))
            .force("centerY", d3.forceY().strength(attractionForce))
            .on("tick", () => {
                particle.id
                    .datum(particle)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
            });

    // .on("tick", () => {
    //         particle.id
    //             .datum(particle)
    //             .attr('cx', d => d.x)
    //             .attr('cy', d => d.y)
    //     });

        // Add orbit trail
        // d3.timer(() => {
        //     vis.svg.append('circle')
        //         .attr('r', 1.5)
        //         .attr('cx', particle.x)
        //         .attr('cy', particle.y)
        //         .transition().duration(500)
        //         .style('opacity', 0)
        //         .remove();
        //
        //     // vis.projection.rotate([vis.config.speed, vis.config.verticalTilt, vis.config.horizontalTilt]);
        //     // vis.svg.selectAll("path")
        //     //     .merge(vis.countries)
        //     //     .attr("d", vis.globePath)
        //     //     .transition()
        //     //     .duration(10);
        // });

        // Spin it
        particle.y = -vis.height / 3;
        particle.vx = 0.55 * vis.height * Math.sqrt(attractionForce);



        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;

        // create random data structure with information for each land

        vis.updateVis()
    }



    updateVis() {
        let vis = this;

        // draw the globe
        vis.globe = vis.svg.selectAll(".country")
            .data(vis.world)

        vis.countries = vis.globe
            .enter().append("path")
            .attr('class', 'country')
            .attr("fill", "green")
            .attr("opacity", 0.6)
            .merge(vis.globe)
            .attr("d", vis.globePath)
        //
        // // rotate the globe
        // // commented out when debugging
        // vis.rotateAngle = 1;

        // d3.timer(function (elapsed) {
        //     // console.log(elapsed)
        //     vis.projection.rotate([vis.config.speed * elapsed, vis.config.verticalTilt, vis.config.horizontalTilt]);
        //     vis.svg.selectAll("path")
        //         .merge(vis.countries)
        //         .attr("d", vis.globePath)
        //         .transition()
        //         .duration(10);
        //
        // });



    }

}
// vis.satPath= vis.svg.append("path")
//     .arcTo(vis.satOriginX, vis.satOriginY,vis.satOriginX, vis.satOriginY)
// .attr("class", "satpath")

// vis.satPath = d3.path();
// vis.satPath.moveTo(vis.satOriginX, vis.satOriginY)
// vis.satPath.arcTo(vis.satOriginX, vis.satOriginY,vis.satOriginX, vis.satOriginY)

// vis.line = d3.linkRadial()
//     .angle(d=>d.x)
//     .radius(d=>d.y)
// vis.lineData={source:{x:vis.satOriginX, y:vis.satOriginY},target:{x:vis.satOriginX, y:vis.satOriginY}}

// vis.lineData
// vis.path = vis.svg.append("path")
//     .attr("d", vis.line)
//     .attr("stroke", "red")
//

// console.log(vis.path)
// vis.sat = vis.svg.append("circle").attr({
//     cx: vis.satOriginX - (vis.satWidth / 2),
//     cy: vis.satOriginY - (vis.satWidth / 2),
//     r: vis.satWidth,
//     width: vis.satWidth,
//     opacity: 1,
//     height: 20,
//     fill: "white",
//     stroke: "red"
// });

// vis.sat=vis.svg.append("circle")
//     .attr("r", vis.satWidth)
//     .attr("cx", vis.satOriginX)
//     .attr("cy", vis.satOriginY)
//     .style("fill", "red")
//     .style("stroke", "red")
//     .attr("class", "orbitSat1")