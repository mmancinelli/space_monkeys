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
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


        vis.radius = vis.width/2

        vis.tree= d3.cluster().size([3*Math.PI, vis.radius-100]);

        vis.root = vis.tree(d3.hierarchy(vis.treeData)
            .sort((a,b)=> d3.ascending(a.name, b.name)));

        // console.log(vis.root)
        // console.log(vis.root.descendants())

        //from observablehq.com/@d3/radial-dendrogram
        vis.svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(vis.root.links())
            .join("path")
            .attr("d", d3.linkRadial()
                .angle(d => d.x)
                .radius(d => d.y));


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

        vis.svg.append("g")
            .selectAll("circle")
            .data(vis.root.descendants())
            .join("circle")
            .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `)
            .attr("fill", d => d.children ? "#555" : "#999")
            .attr("r", 2.5);

        vis.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("text")
            .data(vis.root.descendants())
            .join("text")
            .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${d.y},0) 
        rotate(${d.x >= Math.PI ? 180 : 0})
      `)
            .attr("dy", "0.31em")
            .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
            .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke", "white");
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