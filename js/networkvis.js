/*
* NetworkVis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*
*
 *
 * author: Zane
 * modified from: https://observablehq.com/@d3/radial-dendrogram
 * date created: 11/09/2020
 * date last modified: 12/4/2020
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




        // console.log(age0, age1);

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

        vis.firstLegend = true;

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;
        vis.selectedCategory = selectedCategory;
        vis.legendStatus = true; // controls whether the legend is drawn or not

        // create the text blurbs and assign as needed in if statement
        vis.legendTextAll=[
            ["The top 9 countries with rocket-launching capabilities are USA, China, Russia, Japan, France (ESA), India, Israel, Iran, and North Korea. Russia, China, and the USA make up a solid two-thirds of the space launch industry to-date, but more countries have launched experimental rockets, like Kenya."],
            ["Launching rockets into space is, actually, rocket science. Mistakes will be, and have been, made. Partial failures were counted as failures, and the average success percentage across the entire board is 76.9%. Some of the less-experienced countries such as Brazil, Mexico, and North Korea (thank goodness), incidentally, have the lowest success percentages."],
            ["Choosing the best color scale here was tricky, because most of the rockets are launched 100 times or less....AND then there's Russia crushing it with 200-588 launches for some of its rockets. In comparison, the most-launched shuttle for the US is the Delta II at 158 times."],
            ["Rockets, like most technologies, come and go. The rockets that are currently active and being launched today, according to the dataset, are highlighted in green."],
            ["This is the cumulative shape of the space industry: 14 countries, 59 companies, 167 major rocket types, and 4324 launches. Hover over the circles to find out some more information about them."]]

        // give everything a default color
        vis.rootData.descendants().forEach((d, i) => {
            d["color"] = "#00ffd4";
        })

        // update color based on selection category
        if (vis.selectedCategory == "default") {
            vis.legendStatus = true;
            vis.legendData = [3,2,1,0];
            vis.color = d3.scaleOrdinal()
                .range(["white","#62ff00","#09d4cd","#ac05e9"])
                .domain(vis.legendData)

            vis.rootData.descendants().forEach((d,i)=>{
                d.color= vis.color(d.height)
            })
            vis.legendText = vis.legendTextAll[4];


        }
        else if (vis.selectedCategory == "status") {
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
            let comp = 0;
            let rock = 0;
            vis.rootData.descendants().forEach((d, i) => {
                // console.log(d)
                if (d.height == 2) {
                    let thisCountry = d.data.name
                    if (countryStatus[thisCountry] == true) {
                        d.color = vis.color(vis.legendData[0])
                    }
                } else if (d.height == 1) {
                    comp++
                    let thisCompany = d.data.name;
                    if (companyStatus[thisCompany] == true) {
                        d.color = vis.color(vis.legendData[0])
                    }
                } else if (d.height == 0){
                    rock++
                }
                vis.rootData.descendants()[0].color = vis.color(vis.legendData[0]);
            })
            // console.log(comp, rock)

            // add some text
             vis.legendText = vis.legendTextAll[3]

        }
        else if (vis.selectedCategory == "country") {
            vis.legendStatus = true;

            vis.legendData = vis.myCountries

            // // tell you what though
            // // choosing the right colors for this was a pain. It had to be both visible against the dark sky
            // // and also differentiable from it's direct neighbor. And pretty.
            // // it's like this class. ["juggle the dozens of balls and do well", "get sleep", "have time to work on literally anything else"] : choose 2.
            // vis.rootData.descendants()[0].color = "#fff"
            // vis.color = d3.scaleOrdinal()
            //     .range(["#0e3860", "#7431c4", "#9f0797", "#640345", "#800000", "#ee6666", "#ec7805", "#d49953", "#ffeb04", "#8eac07", "#364e05", "#0b3701", "#08e2b0", "#2f96e7", "#3559e0"])
            //     .domain(vis.legendData)

            vis.color = countryColorScale;

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
            vis.legendText = vis.legendTextAll[0]


        }
        else if (vis.selectedCategory == "success") {
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

            vis.legendText = vis.legendTextAll[1]


        }
        else if (vis.selectedCategory == "total") {
            vis.legendStatus = true;

            // yes, I had to go through and determine where the quantiles were split. By hand.
            vis.legendData = ([0,5,98,199,200 ])
            // quantiles are 1-2,3-18, 19-

            // choosing the right scale for this was the hardest, because most rockets launched <100 times
            // and then there's Russia.
            vis.color = d3.scaleThreshold()
                .domain([5,9,100,200])
                .range(["white", "#ffd013", "#ff5800", "#BE1013", "#9e0cfd"])

            vis.rootData.descendants().forEach((d, i) => {
                // console.log(d)
                if (d.height == 0) {
                    d.color = vis.color(d.data.information.total)
                }
            })
            vis.legendText = vis.legendTextAll[2]


        }
        else {
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
                    // white fill works for some of the color legends but not for success or launches, where white is informational. Changed it to green, which is not used in either of those scales.
                    .attr('fill', d=>{
                        return ((vis.selectedCategory== "total" |vis.selectedCategory == "success") ? "#5ee514" : "white")
                    });
                let yplacement = 0;
                let xplacement = 0;
                if (event.pageY > 620) {
                    yplacement = event.pageY - 350;
                    xplacement = event.pageX - 50;
                } else {
                    yplacement = event.pageY+10;
                }

                // let xplacement = 0;
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
                        .attr('id', 'networkTooltip')
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

                    // extract info
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

                    // console.log(daterange)
                    let dateFormatter = d3.timeFormat("%Y");
                    var parseTime = d3.timeParse("%a %b %e, %Y %I:%M");
                    let parseTime2 = d3.timeParse("%a %b %e, %Y");

                    var firstDate = dateFormatter(parseTime(d3.min(daterange, d => d).slice(0, 22)));
                    if (firstDate == null) {
                        firstDate = dateFormatter(parseTime2(d3.min(daterange, d => d)));
                    }


                    vis.tooltip
                        .attr('id', 'networkTooltip')
                        .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <h3>${d.data.name}<h3>
                         <hr>
                         <p> <strong>Total Launches: </strong>${totalLaunchesX}</p>
                         <p><strong> First Launch: </strong> ${firstDate}</p>
                     </div>`);
                } else if (d.height == 2) {


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
                        .attr('id', 'networkTooltip')
                        .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <h3>${d.data.name}<h3>
                         <hr>
                         <p> <strong>Total Rocket Types: </strong>${totalRockets}</p>
                     </div>`);
                } else if (d.height == 3) {
                    vis.tooltip
                        .attr("id", "spacemonkey")
                        .style("left", 50 + "px")
                        .style("top", 50 +'px')
                        // .style("width", vis.width/3)

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
            .attr("stroke", "black")
            .style("stroke-width", 2);

        vis.circles
            .enter()
            .merge(vis.circleGroups)
            .transition().duration(1000)
            .attr("fill", d => {
                // console.log(d.color)
                return d.color;
            })


        // vis.circles.exit().remove();
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
        vis.body = d3.select("#legendText").data(vis.legendText).attr("class", "networkLegendText")


        var size = 20;

        // make the legend color squares
        vis.legendSquares
            .enter()
            .append("rect")
            .attr("class", "legendSquare")
            .merge(vis.legendSquares)
            .attr("x", 20)
            .attr("width", size)
            .attr("height", size)
            .transition().duration(1000)
            .attr("y", function (d, i) {
                return 100 + i * (size + 5)
            }) // 100 is where the first dot appears. 25 is the distance between dots



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
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .transition().duration(1000)
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
                    // vis.legendData = ([0,5,98,199,200 ])
                    // console.log(d)
                    if (d === 0) {
                        return "0-4"
                    } else if (d === 5) {
                        return "5-9"
                    } else if (d==98){
                        return "10-99"
                    } else if (d==199){
                        return "100-199"
                    } else {
                        return "200+"
                    }

                }else if (vis.selectedCategory == "default") {
                    // vis.legendData = ([0,5,98,199,200 ])
                    // console.log(d)
                    if (d === 3) {
                        return "Rocket Industry"
                    } else if (d === 2) {
                        return "Country"
                    } else if (d===1){
                        return "Company"
                    } else if (d==0){
                        return "Rocket Type"
                    }

                }
                else {
                    return d
                }
            })

        //update text box
        vis.body.enter().append("p").merge(vis.body).text(vis.legendText[0])

        // update legend stuffs
        vis.legendSquares.exit().remove();
        vis.legendLabels.exit().remove();
        vis.body.exit().remove();


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

        // removed magic numbers of d.y in positioning of labels, since it changes with window size apparently
        //
        let secondY;
        vis.rootData.descendants().forEach((d,i)=>{
            if (d.height == 1){
                secondY = d.y
            }
        })
        secondY+=10
        // console.log(secondY)

        // toggle labels
        // TODO Get labels on right side of tree to rotate
        if ($(`#labelToggle`).val() == "ON") {
            vis.networkLabels
                .enter()
                .append('text')
                .attr('class', 'networkCircleLabel')
                .merge(vis.networkLabels)
                // .text(d=>{return (d.data.name+ ", "+ d.y.toFixed(1))})
                // used d.x and d.y to figure out what the fuck was going on with the labels. Placing these things and rotating them correctly was honestly one of the biggest pains in the butt for this entire vis
                .attr("transform", d => `
                rotate(${(d.x * 180 / Math.PI) >= 90 ? d.x - 90 : d.x + 90})
                translate(${d.y},0)
                rotate(${d.x > 1.6 ? 180 : 0})
                rotate(${(d.x > Math.PI & d.x < 180) ? (180, 0, 180) : 0})
                translate(${(d.x > Math.PI & d.x < 180 & d.y > secondY) ? 12 : 0})
                translate(${(d.x > Math.PI & d.x < 180 & d.y < secondY) ? -12 : 0})
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
                        if (d.y > secondY) {
                            return "start"
                        } else if (d.y < secondY) {
                            return "end"
                        }
                    } else if (d.x >= 180) {
                        if (d.y > secondY) {
                            return "end"
                        } else {
                            return "start"
                        }
                    }
                })
                .transition().duration(1000)
                .text(d => d.data.name)

        } else {

            vis.networkLabels.remove();
        }
        vis.networkLabels.exit().remove();
        vis.circleGroups.selectAll(".networkCirclesLabel").exit().remove();
    }



}