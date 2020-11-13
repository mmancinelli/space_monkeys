/*
* NetworkVis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*/

class NetworkVis {


    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;
        // data[3] is the hierarchical array
        this.treeData = this.data[3];
        this.practiceData = this.data[4];
        console.log(this.data[4])

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        //set up SVG drawing area
        // define margins
        vis.margin = {top: 20, right: 50, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width/2}, ${vis.height/2})`);

        console.log(vis.height)
        vis.radius = vis.height/2;

        vis.tree = data => {
            vis.root = d3.hierarchy(data, function(d) {
                return d.children;
            });
            console.log(vis.root)
            // vis.root.x0 =vis.height/2;
            // vis.root.y0=vis.width/2;
            vis.root.dx = 0;
            vis.root.dy = vis.width / (vis.root.height + 1);
            return d3.cluster().size([360, vis.radius-60])(vis.root);
        }
        // var root = vis.tree(vis.practiceData)
        var root = vis.tree(vis.treeData)

        // Features of the links between nodes:
        var linksGenerator = d3.linkRadial()
            .angle(function (d) {
                return d.x / 180 * Math.PI;
            })
            .radius(function (d) {
                return d.y;
            });

        // Add the links between nodes:
        vis.svg.selectAll('path')
            .data(root.links())
            .enter()
            .append('path')
            .attr("d", linksGenerator)
            .style("fill", 'none')
            .attr("stroke", '#ccc')


        // Add a circle for each node.
        vis.svg.selectAll("g")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })
            .append("circle")
            .attr("r", 7)
            .style("fill", "#69b3a2")
            .attr("stroke", "black")
            .style("stroke-width", 2)

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
