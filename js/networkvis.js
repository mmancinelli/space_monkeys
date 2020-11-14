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


    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;
        // data[3] is the hierarchical array
        this.treeData = this.data[3];
        this.practiceData = this.data[4];
        // console.log(this.data[4])

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        //set up SVG drawing area
        // define margins
        vis.margin = {top: 10, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width/2}, ${vis.height/2})`);

        // console.log(vis.height)
        vis.radius = vis.height/2;

        vis.tree = data => {
            // vis.root = d3.hierarchy(data, function(d) {
            //     return d.children;
            // });
            vis.root = d3.hierarchy(data).sort((a, b) => d3.descending(a.height, b.height) || d3.ascending(a.data.name, b.data.name));
            // console.log(vis.root)
            vis.root.x0 =vis.height/2;
            vis.root.y0=vis.width/2;
            vis.root.dx = 0;
            vis.root.dy = vis.width / (vis.root.height + 1);
            return d3.cluster().size([360, vis.radius-60])(vis.root);
        }
        // var root = vis.tree(vis.practiceData)
        vis.rootData = vis.tree(vis.treeData)

        // Features of the links between nodes:
        vis.linksGenerator = d3.linkRadial()
            .angle(function (d) {
                return d.x / 180 * Math.PI;
            })
            .radius(function (d) {
                return d.y;
            });

        // Add the links between nodes:
        vis.links = vis.svg.selectAll('path')
            .attr("class", "links");



        // Add a circle for each node.
        vis.circles = vis.svg.selectAll("g")
            .attr("class", "circles");

        // TODO add tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'networkTooltip');



        // add labels
        // TODO figure out placement
      //   vis.svg.append("g")
      //       .attr("font-family", "sans-serif")
      //       .attr("font-size", 10)
      //       // .attr("stroke-linejoin", "round")
      //       .attr("stroke-width", 0)
      //       .attr("fill", "white")
      //       .selectAll("text")
      //       .data(vis.rootData.descendants())
      //       .join("text")
      //       .attr("transform", d => `
      //   rotate(${d.x * 180 / Math.PI - 90})
      //   translate(${d.y},0)
      //   rotate(${d.x >= Math.PI ? 180 : 0})
      // `)
      //       .attr("dy", "0.31em")
      //       .attr("x", d => d.x < Math.PI === !d.children ? 7 : -7)
      //       .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      //       .text(d => d.data.name)
      //       .clone(true).lower()
      //       .attr("stroke", "white");

        // vis.svg.append("text")
        //     .data(roots.descendants())
        //     .attr("dy", "0.31em")
        //     .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
        //     .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
        //     .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
        //     .text(d=>d.data.name);
      //   vis.svg.append("g")
      //       .attr("font-family", "sans-serif")
      //       .attr("font-size", 12)
      //       // .attr("stroke-linejoin", "round")
      //       .attr("fill", "white")
      //       .attr("stroke-width", 0)
      //       .selectAll("text")
      //       .data(root.descendants())
      //       .join("text")
      //       .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -10; })
      //       .attr("transform", d => `rotate(${d.x < Math.PI ? d.x - 60 : d.x + 60}) translate(${d.y},0) rotate(${d.x >= Math.PI ? 180 : 0})
      // `)
      // //       .attr("transform", d => `rotate(${d.x * 180 / Math.PI}) translate(${d.y},0) rotate(${d.x >= Math.PI ? 180 : 0})
      // // `)
      //       .attr("dy", "0.31em")
      //       // .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
      //       .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      //       .text(d => d.data.name)
      //       .clone(true).lower();

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // Update the visualization
        vis.updateVis();
    }


    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        // draw links
        vis.links
            .data(vis.rootData.links())
            .enter()
            .append('path')
            .attr("d", vis.linksGenerator)
            .style("fill", 'none')
            .attr("stroke", '#ccc');

        // draw circles
        vis.circles
            .data(vis.rootData.descendants())
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })
            .append("circle")
            .attr("r", 4)
            //need to create function for linking circle fill color to information
            .style("fill", "#69b3a2")
            .attr("stroke", "black")
            .style("stroke-width", 2)
            .on('mouseover', function(event, d){
                // console.log(d)
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'grey')

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px");

                if (d.height == 0){
                    // rocket type tooltip
                    vis.tooltip
                        .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <p> <strong>Rocket Type: </strong>${d.data.name}</p>
                         <p> <strong>Company: </strong>${d.data.information.company}</p>
                         <p> <strong>Country: </strong>${d.data.information.country}</p>
                         <p> <strong>Total Launches: </strong>${d.data.information.total}</p>
                     </div>`);
                } else if (d.height == 1){
                    // company tooltip

                    // calculate totals
                    let totalRockets=0;
                    let totalLaunches=0;
                    let totalSuccesses=0;
                    let totalFailures=0;
                    d.data.children.forEach((d,i)=>{
                        totalRockets++;
                        totalLaunches += d.information.total;
                        totalSuccesses += d.information.successes;
                        totalFailures += d.information.failures;
                    })
                    let ratio = totalSuccesses/totalLaunches*100;

                    vis.tooltip
                        .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <h3>${d.data.name}<h3>
                         <hr>
                         <p> <strong>Total Rockets: </strong>${totalRockets}</p>
                         <p> <strong>Success Ratio: </strong>${ratio.toFixed(1)}%</p>
                     </div>`);
                } else if (d.height == 2){

                    // country tooltip
                    // console.log(d)

                    //calculate totals
                    let totalRockets=0;
                    let isActive = 'No';
                    d.data.children.forEach((d,i)=>{
                        // console.log(d)
                        d.children.forEach((d,i)=>{
                            // console.log(d)
                            totalRockets++;
                            if (d.information.status=="StatusActive"){
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
                } else if (d.height == 3){
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
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", "#69b3a2")
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });


    }


    // onSelectionChange(selectionStart, selectionEnd) {
    //     let vis = this;
    //
    //
    //     // Filter data depending on selected time period (brush)
    //
    //     // *** TO-DO ***
    //
    //
    //     vis.wrangleData();
    // }
}

// old code
// vis.tree= d3.cluster().size([360, vis.radius-60]);
//
// vis.tree = data => {
//     // const root = d3.hierarchy(data).sort((a, b) => d3.descending(a.height, b.height) || d3.ascending(a.name, b.name));
//     vis.root = d3.hierarchy(vis.treeData, function(d) {
//         return d.children;
//     });
//     vis.roots.x0 =vis.height/2;
//     vis.roots.y0=0;
//     vis.root.dx = 10;
//     vis.root.dy = vis.width / (vis.root.height + 1);
//     return d3.cluster().size([360, vis.radius-60])(vis.root);
// }
//
//
// vis.clusterData = vis.tree(vis.treeData);
// console.log(vis.clusterData)
//
// vis.linksGenerator = d3.linkRadial()
//     .angle(function(d) { return d.x / 180 * Math.PI; })
//     .radius(function(d) { return d.y; });
//
// vis.circles = vis.svg.append("g")
//     .selectAll("circle")
//     .data(vis.clusterData.descendants())
//     .join("circle")
//     .attr("transform", d => `
//         rotate(${d.x * 180 / Math.PI - 90})
//         translate(${d.y},0)
//       `)
//     .attr("fill", d => d.children ? "#555" : "#999")
//     .attr("r", 2.5);
//
// vis.svg.selectAll('path')
//     .data(vis.clusterData.links())
//     .enter()
//     .append('path')
//     .attr("d", vis.linksGenerator)
//     .style("fill", 'none')
//     .attr("stroke", '#ccc')
//
//
// // Add a circle for each node.
// vis.svg.selectAll("g")
//     .data(vis.root.descendants())
//     .enter()
//     .append("g")
//     .attr("transform", function(d) {
//         return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
//     })
//     .append("circle")
//     .attr("r", 7)
//     .style("fill", "#69b3a2")
//     .attr("stroke", "black")
//     .style("stroke-width", 2)



//   vis.svg.append("g")
//       .attr("fill", "none")
//       .attr("stroke", "#555")
//       .attr("stroke-opacity", 0.4)
//       .attr("stroke-width", 1.5)
//       .selectAll("path")
//       .data(vis.root.links())
//       .join("path")
//       .attr("d", vis.linksGenerator);
//
//   vis.svg.append("g")
//       .attr("font-family", "sans-serif")
//       .attr("font-size", 10)
//       .attr("stroke-linejoin", "round")
//       .attr("stroke-width", 3)
//       .selectAll("text")
//       .data(vis.root.descendants())
//       .join("text")
//       .attr("transform", d => `
//   rotate(${d.x * 180 / Math.PI - 90})
//   translate(${d.y},0)
//   rotate(${d.x >= Math.PI ? 180 : 0})
// `)
//       .attr("dy", "0.31em")
//       .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
//       .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
//       .text(d => d.data.name)
//       .clone(true).lower()
//       .attr("stroke", "white");

// console.log(vis.root)
// console.log(vis.root.descendants())

//from observablehq.com/@d3/radial-dendrogram
