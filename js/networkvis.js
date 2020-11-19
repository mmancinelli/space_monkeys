/*
* NetworkVis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*
* /*
 *
 * author: Zane
 * date created: 11/09/2020
 * date last modified:
 */


class NetworkVis {


    constructor(_parentElement, _legendElement,treeData, practiceData) {
        this.parentElement = _parentElement;
        this.legendElement= _legendElement;
        this.treeData = treeData;
        //this.practiceData = practiceData;
        // console.log(this.data[4])

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        // set up SVG drawing area
        // define margins
        vis.margin = {top: 0, right: 20, bottom: 0, left: 0};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.marginLegend = {top: 10, right: 0, bottom: 0, left: 0};
        vis.widthLegend = $("#" + vis.legendElement).width() - vis.marginLegend.left - vis.marginLegend.right;
        vis.heightLegend = $("#" + vis.legendElement).height() - vis.marginLegend.top - vis.marginLegend.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width / 2}, ${vis.height / 2})`);
        //
        // // init legend area
        vis.svg2 = d3.select("#" + vis.legendElement).append("svg")
            .attr("width", vis.widthLegend + vis.marginLegend .left + vis.marginLegend .right)
            .attr("height", vis.heightLegend  + vis.marginLegend .top + vis.marginLegend .bottom)
            .append('g')
            // .attr('transform', `translate (${vis.widthLegend  / 2}, ${vis.heightLegend  / 2})`);

        // console.log(vis.height)
        vis.radius = vis.height / 2.3;

        vis.tree = data => {
            vis.root = d3.hierarchy(data, function (d) {
                return d.children;
            });
            // this option sorts alphabetically, but then the USA link looks weird, imo
            // vis.root = d3.hierarchy(data).sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name));
            // console.log(vis.root)
            vis.root.x0 = vis.height / 2;
            vis.root.y0 = vis.width / 2;
            vis.root.dx = 0;
            vis.root.dy = vis.width / (vis.root.height + 1);
            return d3.cluster().size([360, vis.radius - 45])(vis.root);
        }
        // var root = vis.tree(vis.practiceData)
        vis.rootData = vis.tree(vis.treeData)
        // console.log(vis.rootData.descendants())

        // vis.rootData.descendants().forEach((d,i)=>)


        // Features of the links between nodes:
        vis.linksGenerator = d3.linkRadial()
            .angle(function (d) {
                return d.x / 180 * Math.PI;
            })
            .radius(function (d) {
                return d.y;
            });

        // set up tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'networkTooltip');

        // create legend item
        vis.legend = vis.svg2.append("g")
            .attr("class", "networkLegend")

        vis.legendData=[];

        vis.myCountries=["USA", "China", "Russia", "Japan","Israel", "New Zealand", "Iran", "France", "India", "Mexico", "Kazakhstan","North Korea", "Brazil", "Kenya","Australia"]




        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;
        vis.selectedCategory = selectedCategory;
        vis.legendStatus = false;

        // give everything a color
        vis.rootData.descendants().forEach((d, i) => {
            d["color"] = "#00ffd4";
        })

        if (vis.selectedCategory == "default") {
            vis.legendStatus = false;
        }
        else if (vis.selectedCategory == "status") {
            // console.log(vis.legendStatus, vis.selectedCategory)
            vis.legendStatus = true;

            vis.legendData = ["StatusActive", "StatusRetired"];
            vis.color = d3.scaleOrdinal()
                .range(["#07b80f","#0327e9"])
                .domain(vis.legendData)

            // set default color
            let countryStatus = [];
            let companyStatus=[]

            vis.rootData.descendants().forEach((d, i) => {
                d.color = vis.color(vis.legendData[1])
                if (d.height == 0) {
                    if (d.data.information.status == "StatusActive") {
                        d.color = vis.color(vis.legendData[0])
                        countryStatus[d.data.information.country]=true;
                        companyStatus[d.data.information.company]=true;
                    } else {
                        d.color = vis.color(vis.legendData[1])
                    }
                }
            })

            vis.rootData.descendants().forEach((d, i) => {
                // console.log(d)
                if (d.height==2){
                    let thisCountry = d.data.name
                    if (countryStatus[thisCountry]==true){
                        d.color = vis.color(vis.legendData[0])
                    }
                } else if (d.height==1){
                    let thisCompany = d.data.name;
                    if (companyStatus[thisCompany]==true){
                        d.color = vis.color(vis.legendData[0])
                    }
                }
                vis.rootData.descendants()[0].color=vis.color(vis.legendData[0]);
            })
        }
        else if (vis.selectedCategory == "country") {
            vis.legendStatus = true;
            // console.log(vis.legendStatus);

            vis.legendData=vis.myCountries

            vis.rootData.descendants()[0].color="#fff"
            vis.color = d3.scaleOrdinal()
                .range([ "#0e3860", "#7431c4", "#9f0797", "#640345","#800000","#ee6666","#ec7805", "#d49953", "#ffeb04","#8eac07", "#364e05", "#0b3701", "#08e2b0", "#2f96e7", "#3559e0"])
                .domain(vis.legendData)

            vis.rootData.children.forEach((d,i)=>{
                let myCountry = d.data.name;
                d.children.forEach((d,i)=>{
                    d.children.forEach((d,i)=>{
                        d.color = vis.color(myCountry)
                        })
                    d.color=vis.color(myCountry)
                })
                d.color=vis.color(myCountry)

            })


        }
        else if (vis.selectedCategory == "success") {
            vis.legendStatus = true;
            // console.log(vis.legendStatus);
            //
            // console.log(vis.rootData)

            vis.legendData=([0,10,20,30,40,50,60,70,80,90,100])


            vis.color = d3.scaleLinear()
                .range(["white", "blue"])
                .domain([0, 100])

            vis.rootData.descendants().forEach((d, i) => {
                console.log(d)
                if (d.height==0){
                    d.color=vis.color(d.data.information.successRatio)
                }
            })



        } else if (vis.selectedCategory == "total") {
            vis.legendStatus = true;
            // console.log(vis.legendStatus);
            //
            // console.log(vis.rootData)

            vis.legendData=([16, 57,124])

            // vis.logScale = d3.scaleLog()
            //     .domain([0, 1800])
            // vis.color = d3.scaleSequential()
            //     .interpolator(d3.interpolateReds)
            //     .domain([0,1800])
            // vis.color = d3.scaleOrdinal()
            //     .range(["white", "light red", "pink", "red"])
            //     .domain([0, 1777])
            // console.log(totalLaunches)
            vis.color = d3.scaleQuantile()
                .domain(totalLaunches)
                .range(["fff","#FFCD06", "#BE1013"])

            // vis.color = d3.scaleQuantize()
            //     .domain([0,1777])
            //     .range(["fff","FFCD06", "#BE1013"])
            // console.log(vis.color(16))
            // console.log(vis.color(122))
            // console.log(vis.color(160))
            //     .range(["fff","FFCD06","#E45323", "#BE1013", "black"])

            vis.rootData.descendants().forEach((d, i) => {
                // console.log(d)
                if (d.height==0){
                    d.color=vis.color(d.data.information.total)
                }
            })



        }else {
            vis.legendStatus = false;
            console.log(vis.legendStatus);

                vis.rootData.descendants().forEach((d, i) => {
                    // console.log(d)
                    d.color = "blue";

                    // d.children.forEach((d,i)=>{
                    //     console.log(d)
                    // })
                })
            }
        // }

        // Update the visualization
        vis.updateVis();
    }


    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;
        // console.log("update triggered");
        // console.log(vis.rootData.descendants())


        vis.links = vis.svg.selectAll("path")
            .data(vis.rootData.links())
            .attr("class", "networkLinks")

        vis.links
            .enter()
            .append("path")
            .attr("d", vis.linksGenerator)
            .style("fill", 'none')
            .attr("stroke", '#ccc');

        vis.links.exit().remove();


        vis.nodeGroups = vis.svg.selectAll(".nodeGroup")
            .data(vis.rootData.descendants())

        // console.log("nodeGroup", vis.nodeGroups)

        vis.circleGroups = vis.nodeGroups
            .enter()
            .append("g")
            .attr("class", (d, i) => `nodeGroup`)
            .merge(vis.nodeGroups)
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })

        // console.log("circleGroup", vis.circleGroups)

        vis.circles = vis.circleGroups
            .append("circle")
            .attr("class", "networkCircle")
            .attr("r", 5)
            .on('mouseover', function (event, d) {
                console.log(event.pageY)
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'white');
                let yplacement=0;
                if (event.pageY >620){
                    yplacement=event.pageY-250;
                } else {
                    yplacement=event.pageY;
                }

                let xplacement=0;
                if (event.pageX > 1000){
                    xplacement= event.pageX-320;
                } else {
                    xplacement=event.pageX+10;
                }
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", xplacement + "px")
                    .style("top", yplacement + "px");

                if (d.height === 0) {
                    // rocket type tooltip
                    vis.tooltip
                        .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <p> <strong>Rocket Type: </strong>${d.data.name}</p>
                         <p> <strong>Company: </strong>${d.data.information.company}</p>
                         <p> <strong>Country: </strong>${d.data.information.country}</p>
                         <p> <strong>Total Launches: </strong>${d.data.information.total}</p>
                         <p> <strong>Status: </strong>${d.data.information.status}</p>
                         <p> <strong>Successful Launches: </strong>${d.data.information.successRatio}%</p>
                         
                     </div>`);
                } else if (d.height === 1) {
                    // company tooltip

                    // calculate totals
                    let totalRockets = 0;
                    let totalLaunches = 0;
                    let totalSuccesses = 0;
                    let totalFailures = 0;
                    d.data.children.forEach((d, i) => {
                        totalRockets++;
                        totalLaunches += d.information.total;
                        totalSuccesses += d.information.successes;
                        totalFailures += d.information.failures;
                    })
                    let ratio = totalSuccesses / totalLaunches * 100;

                    vis.tooltip
                        .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <h3>${d.data.name}<h3>
                         <hr>
                         <p> <strong>Total Launches: </strong>${totalLaunches}</p>
                     </div>`);
                } else if (d.height == 2) {

                    // country tooltip
                    // console.log(d)

                    //calculate totals
                    let totalRockets = 0;
                    let isActive = 'No';
                    d.data.children.forEach((d, i) => {
                        // console.log(d)
                        d.children.forEach((d, i) => {
                            // console.log(d)
                            totalRockets++;
                            if (d.information.status == "StatusActive") {
                                isActive = "Yes";
                            }

                        })
                    })

                    vis.tooltip
                        .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <h3>${d.data.name}<h3>
                         <hr>
                         <p> <strong>Total Rocket Types: </strong>${totalRockets}</p>
                     </div>`);
                } else if (d.height == 3) {
                    //potential easter egg. However, I get a 404 error file not found
                    // need to find the correct way to link to images
                    // var myImagePath = "spacemonkey.png";
                    // // var string = '<img src= + "images/spacemonkey.png" + />`;
                    // vis.tooltip
                    //     .html(`<img src = +" myImagePath + />"`)
                    //     // .html(`img src={\`${API_URL}/${myImagePath}\`}`)//this will add the image on mouseover
                    //     .style("left", (event.pageX + 10) + "px")
                    //     .style("top", (event.pageY + 50) + "px")
                    //     .style("font-color", "white");

                }
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", d=>d.color)
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .attr("fill", d => {
                // console.log(d.color)
                return d.color;
            })
            .attr("stroke", "black")
            .style("stroke-width", 2)

        // console.log("circles", vis.circles)

        vis.circleGroups.exit().remove();

        // vis.legendSquares = vis.legend.selectAll(".myRects")
        //     .data(vis.legendData);

        vis.legendSquares = vis.legend
            .attr("class", "legendSquares")
            .selectAll(".legendSquare")
            .data(vis.legendData);

        vis.legendLabels = vis.legend
            .attr("class", "legendLabels")
            .selectAll(".legendLabel")
            .data(vis.legendData);

        // vis.legendLabels = vis.legend.selectAll(".mylabels")
        //     .data(vis.legendData);

        //toggle legend
        if (vis.legendStatus==true){
            var size = 20;

            vis.legendSquares
                .enter()
                .append("rect")
                .attr("class", "legendSquare")
                .merge(vis.legendSquares)
                .attr("x", 20)
                .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("width", size)
                .attr("height", size)
                .style("fill", function(d){return vis.color(d)});


            vis.legendLabels
                .enter()
                .append("text")
                .attr("class", "legendLabel")
                .merge(vis.legendLabels)
                .attr("x", 60)
                .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)})
                .style("fill", function(d){ return vis.color(d)})
                .text(function(d){
                    if (vis.selectedCategory=="status"){
                        if (d == "StatusActive") {
                            return "Active"
                        } else {
                            return "Retired"
                        }
                    } else if (vis.selectedCategory == "total"){
                        console.log(d)
                        if (d===16){
                            return "0-16"
                        } else if (d===57){
                            return "17-57"
                        } else{
                            return "124-1777"
                        }

                    } else {
                        return d
                        }
                    })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")

            vis.legendSquares.exit().remove();
            vis.legendLabels.exit().remove()

        } else if (vis.legendStatus == false){
            // console.log(vis.legendStatus);
            vis.legendLabels.remove()
            vis.legendSquares.remove();
        }

        vis.legendSquares.exit().remove();
        vis.legendLabels.exit().remove();


        // create label objects
        vis.networkLabels = vis.svg
            .attr("class", "networkCirclesLabels")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("fill", "white")
            .attr("stroke-width", 0.3)
            .attr("stroke", "black")
            .selectAll(".networkCircleLabel")
            .data(vis.rootData.descendants());
        // .text(d=>{return (d.data.name+ ", "+ d.x.toFixed(1))})

        // toggle labels
        // TODO Get labels on right side of tree to rotate
        if ($(`#labelToggle`).val() == "ON") {
            // console.log("labels are on");
            vis.networkLabels
                .enter()
                .append('text')
                .attr('class', 'networkCircleLabel')
                .merge(vis.networkLabels)
                .text(d=>d.data.name)
                // .text(d=>{return (d.data.name+ ", "+ d.y.toFixed(1))})
                .attr("transform", d => `
                rotate(${(d.x * 180 / Math.PI) >= 90 ? d.x - 90 : d.x + 90})
                translate(${d.y},0)
                rotate(${d.x >1.6? 180 : 0})
                rotate(${(d.x >Math.PI & d.x < 180) ? (180,0,180 ) : 0})
                
                translate(${(d.x >Math.PI & d.x < 180 & d.y>270) ? 12 : 0})
                translate(${(d.x >Math.PI & d.x < 180 & d.y<270) ? -12: 0})
                
              `)
                // first rotate spreads the texts around the circle of the tree, with the angle matching the angle of the circle the label is attached to
                // translate pushes the labels from the center out to the correct distance from the center of the tree
                // the second rotate pushes the edge circles' labels from the inside of the circle radius to the outside
                .attr("dy", "0.31em")
                .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
                // .attr("text-anchor", d => d.x < Math.PI  === !d.children ? "start" : "end")
                // .attr("text-anchor", d =>(d.x >Math.PI & d.x < 180 & d.y>270) ? "start" : "end")
                .attr("text-anchor", d => {
                    if (d.x > Math.PI & d.x < 180) {
                        if (d.y > 270) {
                            return "start"
                        } else if (d.y < 270) {
                            return "end"
                        }
                    } else if (d.x >= 180){
                        if (d.y>350){
                            return "end"
                        } else {
                            return "start"
                        }
                    }
                })
                    // (d.x >Math.PI & d.x < 180 & d.y>270) ? "start" : "end"})

        } else {
            // console.log("labels are off")
            // vis.nodeGroups.selectAll(".networkCirclesLabel").remove();
            vis.networkLabels.remove();
        }
        vis.networkLabels.exit().remove();
        vis.circleGroups.selectAll(".networkCirclesLabel").exit().remove();
    }


//         // create label objects
//         vis.networkLabels = vis.nodeGroups
//             .attr("font-family", "sans-serif")
//             .attr("font-size", 12)
//             .attr("fill", "white")
//             .attr("stroke-width", 0.3)
//             .attr("stroke", "black")
//             .selectAll(".networkCircleLabel")
//             .data(d=>d)
//             ;
//
//         console.log("labels", vis.networkLabels)
//
//         // .text(d=>{return (d.data.name+ ", "+ d.x.toFixed(1))})
//
//         // toggle labels
//         // TODO Get labels on right side of tree to rotate
//         if ($(`#labelToggle`).val() == "ON"){
//             // console.log("labels are on");
//             vis.networkLabels
//                 .enter()
//                 .append('text')
//                 .attr('class', 'networkCircleLabel')
//                 .merge(vis.networkLabels)
//                 .text(d => {
//                     // console.log(d.data.name)
//                     return d.data.name})
//                 .attr("transform", d => `
//
//                 rotate(${d.x > Math.PI ? 180 : 0})
//               `)
//                 // first rotate spreads the texts around the circle of the tree, with the angle matching the angle of the circle the label is attached to
//                 // translate pushes the labels from the center out to the correct distance from the center of the tree
//                 // the second rotate pushes the edge circles' labels from the inside of the circle radius to the outside
//                 .attr("dy", "0.31em")
//                 .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
//                 .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end");
//         } else {
//             console.log("labels are off")
//             vis.nodeGroups.selectAll(".networkCirclesLabel").remove();
//             vis.networkLabels.remove();
//         }
//         vis.nodeGroups.exit().remove();
//         vis.circleGroups.selectAll(".networkCirclesLabel").exit().remove();
//     }
//
}

//translate(${(d.x > 0 & d.x > 180) ? 180 : 0})
// rotate(${(d.x > 0 & d.x > 180) ? (180, dx, dy+20) : (0,0,0)})

//// rotate(${(d.x >1.6 & d.x<180)? 180 : 0})
// translate(${d.y},0)
// rotate(${(d.x >0 & d.x < 180) ? (180, 0, 0) : 0}

// translate(${(d.x > 0 & d.x > 180) ? (-d3.select(this).attr("width")/2, -d3.select(this).attr("height")/2+10)(): 0}