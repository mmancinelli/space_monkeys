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


    constructor(_parentElement, _legendElement, treeData) {
        this.parentElement = _parentElement;
        this.legendElement = _legendElement;
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
        vis.margin = {top: 5, right: 10, bottom: 0, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.marginLegend = {top: 0, right: 0, bottom: 100, left: 0};
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
            .attr("width", vis.widthLegend + vis.marginLegend.left + vis.marginLegend.right)
            .attr("height", vis.heightLegend + vis.marginLegend.top + vis.marginLegend.bottom)
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

        vis.legendData = [];

        vis.myCountries = ["USA", "China", "Russia", "Japan", "Israel", "New Zealand", "Iran", "France", "India", "Mexico", "Kazakhstan", "North Korea", "Brazil", "Kenya", "Australia"]


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;
        vis.selectedCategory = selectedCategory;
        vis.legendStatus = false; // controls whether the legend is drawn or not

        // give everything a default color
        vis.rootData.descendants().forEach((d, i) => {
            d["color"] = "#00ffd4";
        })

        // update color based on selection category
        if (vis.selectedCategory == "default") {
            vis.legendStatus = false;
        } else if (vis.selectedCategory == "status") {
            vis.legendStatus = true;

            // vis.legendData, vis.color, and vis.legendText are all standardized across the if statement and used when drawing the legend

            vis.legendData = ["StatusActive", "StatusRetired"];
            vis.color = d3.scaleOrdinal()
                .range(["#07b80f", "#0327e9"])
                .domain(vis.legendData)

            // arrays used to propagate the color up the rings
            let countryStatus = [];
            let companyStatus = []

            // if active or retired, set color
            // if active, then add the country and company to the propagation arrays
            vis.rootData.descendants().forEach((d, i) => {
                d.color = vis.color(vis.legendData[1])
                if (d.height == 0) {
                    if (d.data.information.status == "StatusActive") {
                        d.color = vis.color(vis.legendData[0])
                        countryStatus[d.data.information.country] = true;
                        companyStatus[d.data.information.company] = true;
                    } else {
                        d.color = vis.color(vis.legendData[1])
                    }
                }
            })

            // cycle through the data
            // for the countries and companies, check to see if they are listed as true in the propagation arrays
            // if so, also set the color for those as 'active'
            vis.rootData.descendants().forEach((d, i) => {
                // console.log(d)
                if (d.height == 2) {
                    let thisCountry = d.data.name
                    if (countryStatus[thisCountry] == true) {
                        d.color = vis.color(vis.legendData[0])
                    }
                } else if (d.height == 1) {
                    let thisCompany = d.data.name;
                    if (companyStatus[thisCompany] == true) {
                        d.color = vis.color(vis.legendData[0])
                    }
                }
                vis.rootData.descendants()[0].color = vis.color(vis.legendData[0]);
            })

            // add some text
            // probably could have just added these in one long array somewhere and set vis.legendText using an index
            // but oh well. This works fine.
            vis.legendText = ["Rockets, like fashion, come and go. Here is an overview of the rockets listed as active in the dataset."]

        } else if (vis.selectedCategory == "country") {
            vis.legendStatus = true;

            vis.legendData = vis.myCountries

            // tell you what though
            // choosing the right colors for this was a pain. It had to be both visible against the dark sky
            // and also differentiable from it's direct neighbor. And pretty.
            // it's like this class. ["juggle the dozens of balls and do well", "get sleep", "have time to work on literally anything else"] : choose 2.
            vis.rootData.descendants()[0].color = "#fff"
            vis.color = d3.scaleOrdinal()
                .range(["#0e3860", "#7431c4", "#9f0797", "#640345", "#800000", "#ee6666", "#ec7805", "#d49953", "#ffeb04", "#8eac07", "#364e05", "#0b3701", "#08e2b0", "#2f96e7", "#3559e0"])
                .domain(vis.legendData)

            vis.rootData.children.forEach((d, i) => {
                let myCountry = d.data.name;
                d.children.forEach((d, i) => {
                    d.children.forEach((d, i) => {
                        d.color = vis.color(myCountry)
                    })
                    d.color = vis.color(myCountry)
                })
                d.color = vis.color(myCountry)

            })
            vis.legendText = ["While only 10 countries officially have the capability to launch rockets into space, the others have launched experimental/science-focused rockets."]


        } else if (vis.selectedCategory == "success") {
            vis.legendStatus = true;

            vis.legendData = ([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])

            // since the values go from literally 0 to 99.3, linear scale seemed like the best best
            vis.color = d3.scaleLinear()
                .range(["white", "blue"])
                .domain([0, 100])

            vis.rootData.descendants().forEach((d, i) => {
                // console.log(d)
                if (d.height == 0) {
                    d.color = vis.color(d.data.information.successRatio)
                }
            })

            vis.legendText = ["Launching rockets into space is, actually, rocket science. That is to say, mistakes will be made."]


        } else if (vis.selectedCategory == "total") {
            vis.legendStatus = true;

            // yes, I had to go through and determine where the quantiles were split. By hand.
            vis.legendData = ([2, 5, 18,19 ])
            // quantiles are 1-2,3-18, 19-

            // choosing the right scale for this was the hardest, because most rockets launched <100 times
            // and then there's Russia.
            // using the quantile scale showed the most diversity, but masks just how outrageously higher Russia is than everyone else.

            // vis.color = d3.scaleSequential()
            //     .domain([0, 600])
            //     .range(["white", "red"])
            // vis.color = d3.scaleSequential()
            //     .interpolator(d3.interpolateReds)
            //     .domain([0,600])
            // vis.color = d3.scaleOrdinal()
            //     .range(["white", "yellow", "orange", "red"])
            //     .domain([0, 600])
            // console.log(totalLaunches)
            vis.color = d3.scaleQuantile()
                .domain(totalLaunches)
                .range(["white", "#FFCD06", "#ff7e08", "#BE1013"])

            // vis.color = d3.scaleQuantize()
            //     .domain([0,1777])
            //     .range(["fff","FFCD06", "#BE1013"])
            // console.log(vis.color(3))
            // console.log(vis.color(4))
            // console.log(vis.color(5))
            //     .range(["fff","FFCD06","#E45323", "#BE1013", "black"])

            vis.rootData.descendants().forEach((d, i) => {
                // console.log(d)
                if (d.height == 0) {
                    d.color = vis.color(d.data.information.total)
                }
            })
            vis.legendText = ["The choosing the right color scale here was tricky, because most of the rockets are launched 150 times or less....than then there's Russia with 1700+ launches of some rockets.."]


        } else {
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


        // drawing the links
        // the one thing I don't think I ever had to troubleshoot
        // probably because I never changed it.
        vis.links = vis.svg.selectAll("path")
            .data(vis.rootData.links())
            .attr("class", "networkLinks")

        vis.links
            .enter()
            .append("path")
            .attr("d", vis.linksGenerator)
            .style("fill", 'none')
            .style("stroke-width", "0.5px")
            .attr("stroke", '#ccc');

        vis.links.exit().remove();


        // draw the circles
        // shout-out to Robert R.
        vis.nodeGroups = vis.svg.selectAll(".nodeGroup")
            .data(vis.rootData.descendants());

        vis.circleGroups = vis.nodeGroups
            .enter()
            .append("g")
            .attr("class", (d, i) => `nodeGroup`)
            .merge(vis.nodeGroups)
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })

        vis.circles = vis.circleGroups
            .append("circle")
            .attr("class", "networkCircle")
            .attr("r", 5)
            .on('mouseover', function (event, d) {
                // console.log(event.pageY)
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'white');
                let yplacement = 0;
                if (event.pageY > 620) {
                    yplacement = event.pageY - 250;
                } else {
                    yplacement = event.pageY;
                }

                let xplacement = 0;
                if (event.pageX > 1000) {
                    xplacement = event.pageX - 320;
                } else {
                    xplacement = event.pageX + 10;
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
                    // let totalRockets = 0;
                    let totalLaunchesX = 0;
                    // let totalSuccesses = 0;
                    // let totalFailures = 0;
                    let daterange = [];
                    d.data.children.forEach((d, i) => {
                        // totalRockets++;
                        totalLaunchesX += d.information.total;
                        // totalSuccesses += d.information.successes;
                        // totalFailures += d.information.failures;
                        daterange.push(d.information.date)
                    })

                    console.log(daterange)
                    let dateFormatter = d3.timeFormat("%Y");
                    var parseTime = d3.timeParse("%a %b %e, %Y %I:%M");
                    let parseTime2 = d3.timeParse("%a %b %e, %Y");

                    var firstDate = dateFormatter(parseTime(d3.min(daterange, d => d).slice(0, 22)));
                    if (firstDate == null) {
                        firstDate = dateFormatter(parseTime2(d3.min(daterange, d => d)));
                    }


                    vis.tooltip
                        .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <h3>${d.data.name}<h3>
                         <hr>
                         <p> <strong>Total Launches: </strong>${totalLaunchesX}</p>
                         <p><strong> First Launch: </strong> ${firstDate}</p>
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
                    .attr("fill", d => d.color)
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

        vis.circleGroups.exit().remove();

        // set up stuff for the labels
        vis.legendSquares = vis.legend
            .attr("class", "legendSquares")
            .selectAll(".legendSquare")
            .data(vis.legendData);

        vis.legendLabels = vis.legend
            .attr("class", "legendLabels")
            .selectAll(".legendLabel")
            .data(vis.legendData);

        // grab the legend text element to update the text box
        vis.body = d3.select("#legendText")

        //toggle legend
        if (vis.legendStatus == true) {
            var size = 20;

            // make the legend color squares
            vis.legendSquares
                .enter()
                .append("rect")
                .attr("class", "legendSquare")
                .merge(vis.legendSquares)
                .attr("x", 20)
                .attr("y", function (d, i) {
                    return 100 + i * (size + 5)
                }) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("width", size)
                .attr("height", size)
                .style("fill", function (d) {
                    return vis.color(d)
                });

            // make the legend text, colored the same
            vis.legendLabels
                .enter()
                .append("text")
                .attr("class", "legendLabel")
                .merge(vis.legendLabels)
                .attr("x", 60)
                .attr("y", function (d, i) {
                    return 100 + i * (size + 5) + (size / 2)
                })
                .style("fill", function (d) {
                    return vis.color(d)
                })
                .text(function (d) {
                    if (vis.selectedCategory == "status") {
                        if (d == "StatusActive") {
                            return "Active"
                        } else {
                            return "Retired"
                        }
                    } else if (vis.selectedCategory == "total") {
                        // console.log(d)
                        if (d === 2) {
                            return "0-2"
                        } else if (d === 5) {
                            return "3-5"
                        } else if (d==18){
                            return "6-18"
                        } else {
                            return "19-588"
                        }

                    }
                    else {
                        return d
                    }
                })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle");

            //remove the current text box if there is one
            vis.body.selectAll("p").remove();

            // add new text info
            vis.body.append("p").text(vis.legendText[0])

            // update legend stuffs
            vis.legendSquares.exit().remove();
            vis.legendLabels.exit().remove();

        } else if (vis.legendStatus == false) {
            // if legend is off, remove all the stuff and wipe the slate clean
            vis.legendLabels.remove();
            vis.legendSquares.remove();
            vis.body.selectAll("p").remove();

        }

        // commented out because are they even used anymore?
        // vis.legendSquares.exit().remove();
        // vis.legendLabels.exit().remove();


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

        // toggle labels
        // TODO Get labels on right side of tree to rotate
        if ($(`#labelToggle`).val() == "ON") {
            vis.networkLabels
                .enter()
                .append('text')
                .attr('class', 'networkCircleLabel')
                .merge(vis.networkLabels)
                .text(d => d.data.name)
                // .text(d=>{return (d.data.name+ ", "+ d.y.toFixed(1))})
                // used d.x and d.y to figure out what the fuck was going on with the labels. Placing these things and rotating them correctly was honestly one of the biggest pains in the butt for this entire vis
                .attr("transform", d => `
                rotate(${(d.x * 180 / Math.PI) >= 90 ? d.x - 90 : d.x + 90})
                translate(${d.y},0)
                rotate(${d.x > 1.6 ? 180 : 0})
                rotate(${(d.x > Math.PI & d.x < 180) ? (180, 0, 180) : 0})
                translate(${(d.x > Math.PI & d.x < 180 & d.y > 270) ? 12 : 0})
                translate(${(d.x > Math.PI & d.x < 180 & d.y < 270) ? -12 : 0})
              `)
                // first rotate spreads the texts around the circle of the tree, with the angle matching the angle of the circle the label is attached to
                // translate pushes the labels from the center out to the correct distance from the center of the tree
                // the second rotate pushes the edge circles' labels from the inside of the circle radius to the outside
                // fourth rotate rotates the labels on the right side of the circle to get them right side up, but they overlap the circles
                // second translate pushes the labels on the outer ring out past their respective circles
                // third translate pushes the labels on the inner rings inwards, removing their overlap
                .attr("dy", "0.31em")
                .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
                // depending on if they are on the right side or the left side of the circle, and if they are on an inner ring or the outer one - text anchor them at the start or end
                .attr("text-anchor", d => {
                    if (d.x > Math.PI & d.x < 180) {
                        if (d.y > 270) {
                            return "start"
                        } else if (d.y < 270) {
                            return "end"
                        }
                    } else if (d.x >= 180) {
                        if (d.y > 350) {
                            return "end"
                        } else {
                            return "start"
                        }
                    }
                })

        } else {

            vis.networkLabels.remove();
        }
        vis.networkLabels.exit().remove();
        vis.circleGroups.selectAll(".networkCirclesLabel").exit().remove();
    }

}