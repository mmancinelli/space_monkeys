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


    constructor(_parentElement, treeData, practiceData) {
        this.parentElement = _parentElement;
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
        vis.margin = {top: 0, right: 20, bottom: 20, left: 0};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width / 2}, ${vis.height / 2})`);

        // console.log(vis.height)
        vis.radius = vis.height / 2.2;

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

        // vis.circles = vis.svg.selectAll("g")
        //     .data(vis.rootData.descendants()
        //     )
        //     .attr("class", "circles");

        // vis.svg.selectAll("g")
        //     .data(vis.rootData.descendants(), (d,i)=> {
        //         // console.log(i);
        //         return i
        //     })
        //     .enter()
        //     .append("g")
        //     .attr("class", (d,i)=>`nodeGroup-${i}`)
        //     .attr("transform", function (d) {
        //         return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
        //     });

        vis.nodeGroups = vis.svg.selectAll("g")
            .data(vis.rootData.descendants(), (d, i) => {
                // console.log(i);
                return i
            })
        // .enter()
        // .append("g")
        // .attr("class", (d,i)=>`nodeGroup-${i}`)
        // .attr("transform", function (d) {
        //     return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
        // });

        // set up tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'networkTooltip');


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;
        vis.selectedCategory = selectedCategory;
        console.log(vis.selectedCategory);
        vis.legendStatus = false;

        if (vis.selectedCategory == "default") {
            vis.legendStatus = false;
            vis.rootData.descendants().forEach((d, i) => {
                // console.log(d)
                d["color"] = "#00ffd4";
                // })
            })
        } else if (vis.selectedCategory == "status") {
            console.log(vis.legendStatus, vis.selectedCategory)
            vis.legendStatus = true;
            vis.rootData.descendants().forEach((d, i) => {
                d["color"] = "#00ffd4";

                // console.log(d)
            })
            // console.log(vis.rootData)
            var setStatus = [];
            vis.rootData.descendants().forEach((d, i) => {

                if (d.height == 0) {
                    // // d.children.forEach((d, j) => {
                    //
                    //     // d.children.forEach((d, k) => {
                    //
                    //         // console.log(d)
                    if (d.data.information.status == "StatusActive") {
                        // console.log("Active")
                        d.color = "#e416fe"
                        // setStatus[j] = true;
                    }
                    //     // })
                    //     // if (setStatus[j] = "true") {
                    //     //     console.log(setStatus)
                    //     //     d.color = "green"
                    //     // }
                    //
                    // // })
                } else {
                    d.color = "#00ffd4"
                }
            })

            // console.log(vis.rootData.descendants())
        }
            // if (d.height == 0 && d.data.information.status=="StatusActive"){
            //     d.color="green"
            //     d.parent.color="green"
            //     d.parent.parent.color="green"
        // }
        else {
            vis.legendStatus = false;
            vis.rootData.descendants().forEach((d, i) => {
                // console.log(d)
                d["color"] = "blue";

                // d.children.forEach((d,i)=>{
                //     console.log(d)
                // })
            })
        }

        // Update the visualization
        vis.updateVis();
    }


    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;
        console.log("update triggered");
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
                // console.log(d)
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'white')

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px");

                if (d.height === 0) {
                    // rocket type tooltip
                    vis.tooltip
                        .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <p> <strong>Rocket Type: </strong>${d.data.name}</p>
                         <p> <strong>Company: </strong>${d.data.information.company}</p>
                         <p> <strong>Country: </strong>${d.data.information.country}</p>
                         <p> <strong>Total Launches: </strong>${d.data.information.total}</p>
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
                         <p> <strong>Success Ratio: </strong>${ratio.toFixed(1)}%</p>
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
                         <p> <strong>Currently Active?: </strong>${isActive}</p>
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
                    .attr("fill", "#20bac5")
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

        console.log("circles", vis.circles)

        vis.circleGroups.exit().remove();

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
            console.log("labels are off")
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