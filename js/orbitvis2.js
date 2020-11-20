/*
 * Orbitvis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 *
 * author: Zane
 * date started: 11/19/2020
 * date last modified: 11/20/2020
 */

class Orbitvis2 {


    constructor(_parentElement, satelliteData, geoData) {
        this.parentElement = _parentElement;
        this.geoData = geoData;
        this.satData = satelliteData;

        console.log(this.satData)

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
        vis.projection = d3.geoOrthographic()
            //d3.geoStereographic()//
            .scale(50)
            .translate([vis.width / 2, vis.height / 2])
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
            speed: 0.005,
            verticalTilt: -30,
            horizontalTilt: 0
        }

        // trying the orbital trajectory code

        vis.satWidth = 2;
        vis.originX = vis.width/2;
        vis.originY = vis.height/2;
        vis.innerCircleRadius = 50;
        vis.outerCircleRadius = 66;

        vis.satOriginX = vis.originX+ ((vis.outerCircleRadius) * Math.sin(0)) ;
        //+ ((vis.outerCircleRadius) * Math.sin(0))
        vis.satOriginY = vis.originY- ((vis.outerCircleRadius) * Math.cos(0));

        vis.sat=vis.svg.append("circle")
            .attr("r", vis.satWidth)
            .attr("cx", vis.satOriginX)
            .attr("cy", vis.satOriginY)
            .style("fill", "red")
            .style("stroke", "red")
            .attr("class", "orbitSat3")


        vis.orbitDistance = vis.height / 4,
            vis.G = 1e-3 * Math.pow(vis.orbitDistance, 3), // Proportional to cube of orbit distance to maintain behavior over different heights
            vis.centralMass = 1,
            vis.orbitalV = Math.sqrt(vis.G * vis.centralMass / vis.orbitDistance);

        vis.initialV = vis.orbitalV
        vis.numPnts = 5000;

// Draw scaffold canvas

       vis.sat.attr('cy', -vis.orbitDistance);

        simulateTrajectory(vis.orbitalV, vis.numPnts);

//

        function simulateTrajectory(initV, numTicks) {
            vis.satellite = {
                    mass: 0,
                    x: 0,
                    y: -vis.orbitDistance,
                    vx: initV,
                    vy: 0
                }
            vis.forceSim = d3.forceSimulation()
                    .alphaDecay(0)
                    .velocityDecay(0)
                    .stop()
                    .force('gravity', d3.forceMagnetic()
                        .strength(vis.G)
                        .charge(d => d.mass)
                    )
                    .nodes([
                        { mass: vis.centralMass },
                        vis.satellite
                    ]);

            // Clear canvas
            const ctx = d3.select('canvas#trails')
                .attr('width', vis.width)
                .attr('height', vis.height)
                .node()
                .getContext('2d');

            ctx.translate(vis.width/2, vis.height/2);
            ctx.fillStyle = 'rgba(0, 0, 75, .35)';

            d3.range(numTicks).forEach(() => {
                vis.forceSim.tick();

                ctx.beginPath();
                ctx.fillRect(vis.satellite.x, vis.satellite.y, 1, 1);
                ctx.fill();
            });

            // Animate satellite
            vis.elSatellite = vis.sat;
            vis.satellite.x = 0;
            vis.satellite.y = -vis.orbitDistance;
            vis.satellite.vx = initV;
            vis.satellite.vy = 0;

            vis.forceSim.restart()
                .on('tick', () => {
                    vis.elSatellite.attr('cx', d => d.x)
                        .attr('cy', d => d.y);
                });
        }


// // Event handlers
//         function onVelocityChange(relV) {
//             d3.select('#velocity-val').text(relV);
//             initialV = relV * vis.orbitalV;
//             simulateTrajectory(initialV, numPnts);
//         }
//
//         function onNumSamplesChange(num) {
//             d3.select('#samples-val').text(num);
//             vis.numPnts = num;
//             simulateTrajectory(vis.initialV, vis.numPnts);
//         }
        // draw satellites




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

        // rotate the globe
        // commented out when debugging
        d3.timer(function (elapsed) {
            // console.log(elapsed)
            vis.projection.rotate([vis.config.speed * elapsed, vis.config.verticalTilt, vis.config.horizontalTilt]);
            vis.svg.selectAll("path")
                .merge(vis.countries)
                .attr("d", vis.globePath)
                .transition()
                .duration(100);
        });



    }

}
