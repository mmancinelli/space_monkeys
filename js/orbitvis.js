/*
 * Orbitvis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 *
 * author: Zane
 * date started: 11/19/2020
 * date last modified: 11/20/2020
 */

class Orbitvis {


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



        // draw satellites


        vis.originX = vis.width/2;
        vis.originY = vis.height/2;
        vis.innerCircleRadius = 60;
        // vis.outerCircleRadius = 66;
        // 1 km = 0.00768px
        vis.outerCircleRadius = vis.innerCircleRadius+vis.satData[0]["Apogee (km)"]*0.0078;
        console.log(vis.outerCircleRadius)


        // vis.innerCircle=vis.svg.append("circle")
        //     .attr("r", vis.innerCircleRadius)
        //     .attr("cx", vis.originX)
        //     .attr("cy", vis.originY)
        //     .style("fill", "none")
        //     .style("stroke", "red")
        //     .attr("class", "orbitCircle1")


        // vis.outerCircle=vis.svg.append("circle")
        //     .attr("r", vis.outerCircleRadius)
        //     .attr("cx", vis.originX)
        //     .attr("cy", vis.originY)
        //     .style("fill", "none")
        //     .style("stroke", "red")
        //     .attr("class", "orbitCircle2")



        vis.satOriginX = vis.originX+ ((vis.outerCircleRadius) * Math.sin(0)) ;
        //+ ((vis.outerCircleRadius) * Math.sin(0))
        vis.satOriginY = vis.originY- ((vis.outerCircleRadius) * Math.cos(0));

        // vis.satPath= vis.svg.append("path")
        //     .arcTo(vis.satOriginX, vis.satOriginY,vis.satOriginX, vis.satOriginY)
            // .attr("class", "satpath")

        vis.satPath = d3.path();
        vis.satPath.moveTo(vis.satOriginX, vis.satOriginY)
        vis.satPath.arcTo(vis.satOriginX, vis.satOriginY,vis.satOriginX, vis.satOriginY)

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
        vis.satWidth = 2;
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

        vis.sat=vis.svg.append("circle")
            .attr("r", vis.satWidth)
            .attr("cx", vis.satOriginX)
            .attr("cy", vis.satOriginY)
            .style("fill", "red")
            .style("stroke", "red")
            .attr("class", "orbitSat1")
            .transition()
            .delay(250)
            .duration(1000)
        //     .tween("pathTween", function(){return pathTween(vis.path)})
        // // .tween("pathTween", pathTween); //Custom tween to set the cx and cy attributes
        //
        // function pathTween(path){
        //     var length = path.node().getTotalLength(); // Get the length of the path
        //     var r = d3.interpolate(0, length); //Set up interpolation from 0 to the path length
        //     return function(t){
        //         var point = path.node().getPointAtLength(r(t)); // Get the next point along the path
        //         d3.select(this) // Select the circle
        //             .attr("cx", point.x) // Set the cx
        //             .attr("cy", point.y) // Set the cy
        //     }
        // }

        // vis.sat.attr("transform", `rotate(45, ${vis.originX}, ${vis.originY})`);
        // rotating the chair
        vis.tween = function (d, i, a) {
            return d3.interpolateString(`rotate(0, ${vis.originX}, ${vis.originY})`, `rotate(359, ${vis.originX}, ${vis.originY})`);
        }

        vis.sat.transition().delay(2000).duration(4000).attrTween("transform", vis.tween);


// // fading out the intermediate objects
//         pointOnOuterCircle.transition().delay(4000).duration(500).style("opacity", 0);
//         outerCircle.transition().delay(4000).duration(500).style("opacity", 0);




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

            // vis.sat.transition().delay(2000).duration(4000).attrTween("transform", vis.tween);

        });



    }

}
