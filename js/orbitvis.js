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
        vis.svg = d3.select("#" + vis.parentElement)
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // ****************************************
        //             GLOBE
        // ****************************************

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



        // ****************************************
        //             SATELLITES
        // ****************************************


        vis.originX = vis.width/2;
        vis.originY = vis.height/2;
        vis.innerCircleRadius = 60;
        // vis.outerCircleRadius = 66;
        // 1 km = 0.00768px
        vis.outerCircleRadius = vis.innerCircleRadius+vis.satData[1]["Apogee (km)"]*0.0078;
        console.log(d3.min(vis.satData, d=>d["Apogee (km)"]), d3.max(vis.satData, d=>d["Apogee (km)"]))
        // console.log(d3.extent(vis.satData, d=>d["Class of Orbit"]))


        vis.satDataSubset = vis.satData.splice(0,3)
        console.log(vis.satDataSubset)



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

        //jitter function on circle radius
        // xMap = function(d) { return (xScale(xValue(d)) + Math.random()*10);}



        vis.satOriginX = vis.originX+ ((vis.outerCircleRadius) * Math.sin(0));
        //+ ((vis.outerCircleRadius) * Math.sin(0))
        vis.satOriginY = vis.originY- ((vis.outerCircleRadius) * Math.cos(0));


        vis.satWidth = 2;

        vis.sats = vis.svg.selectAll(".satCircle")
            .data(vis.satDataSubset);


        vis.sat=vis.sats
            .enter()
            .append("circle")
            .attr("class", "satCircle")
            .merge(vis.sats)
            .attr("r", vis.satWidth)
            .attr("cx", (d,i)=>{
                return ((vis.originX+ ((d.Apogee) * Math.sin(0)+ Math.random()*10))*0.008+60)
            })
            .attr("cy", (d,i)=> {
                return ((vis.originY+ ((d.Apogee) * Math.cos(0)+ Math.random()*10))*0.008+60)
            })
            .style("fill", "red")
            .style("stroke", "red");
            // .transition()
            // .delay(250)
            // .duration(2000)
            // .selection()

        // vis.sat.attr("transform", `rotate(45, ${vis.originX}, ${vis.originY})`);
        // rotating the chair
        vis.tween = function (d, i, a) {
            return d3.interpolateString(`rotate(0, ${vis.originX}, ${vis.originY})`, `rotate(${vis.rotateAngle}, ${vis.originX}, ${vis.originY})`);
        }

        // vis.sat.transition().delay(2000).duration(4000).attrTween("transform", vis.tween);


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
        vis.rotateAngle = 1;

        d3.timer(function (elapsed) {
            // console.log(elapsed)
            // vis.projection.rotate([vis.config.speed * elapsed, vis.config.verticalTilt, vis.config.horizontalTilt]);
            // vis.svg.selectAll("path")
            //     .merge(vis.countries)
            //     .attr("d", vis.globePath)
            //     .transition()
            //     .duration(10);

            // console.log(vis.rotateAngle)
            if (vis.rotateAngle >=359){
                vis.rotateAngle = 1;
            } else {
                vis.rotateAngle += 5
            }

            vis.sat.transition().duration(5).attrTween("transform", vis.tween);

        });



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