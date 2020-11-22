class OrbitSystem {


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

        let vis = this;


        vis.margin = {top: 10, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        // vis.svg = d3.select("#" + vis.parentElement)
        //     .attr("width", vis.width)
        //     .attr("height", vis.height)
        //     .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // var w     = 1600;
        // var h     = 1400;
        vis.x = (vis.width / 2);
        vis.y = vis.height / 2;
        vis.t0 = new Date().setHours(0, 0, 0, 0);
        vis.delta = (Date.now() - vis.t0);

// insert svg element
        vis.svg = d3.select('#orbit-vis').insert("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // ****************************************
        //             GLOBE
        // ****************************************

        // //draw globe
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


// planets and moons
        vis.planets = [
            {
                R: 73, r: 2, speed: -1.60, phi0: 35, moons: [   // mercury
                ]
            },
            {
                R: 95, r: 2, speed: -1.17, phi0: 185, moons: [   // venus
                ]
            },
            {
                R: 95, r: 5, speed: -1.17, phi0: 185, moons: [   // venus
                ]
            },
            {
                R: 137, r: 2, speed: -1.00, phi0: 135, moons:[]
            },
            {
                R: 190, r: 1, speed: -0.80, phi0: 235, moons: []
            },
            {
                R: 120, r: 2, speed: -1.17, phi0: 20, moons: [   // venus
                ]
            },
            {
                R: 100, r: 5, speed: -1.17, phi0: 142, moons: [   // venus
                ]
            },
            {
                R: 150, r: 2, speed: -1.00, phi0: 350, moons: []
            },
            {
                R: 200, r: 1, speed: -0.80, phi0: 75, moons: []
            }
        ];


// sun
//         vis.svg.append("circle")
//             .attr("r", 50)
//             .attr("cx", vis.x)
//             .attr("cy", vis.y)
//             .attr("id", "sun");






        vis.wrangleData()

    }

    wrangleData() {
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

        // planet group
        vis.container = vis.svg.append("g")
            .attr("id", "orbit_container")
            .attr("transform", "translate(" + vis.x + "," + vis.y + ")");

// draw planets and moon clusters
        vis.container.selectAll("g.planet").data(vis.planets).enter().append("g")
            .attr("class", "planet_cluster").each(function (d, i) {
            // d3.select(this).append("circle").attr("class", "orbit")
            //     .attr("r", d.R);
                d3.select(this).append("circle").attr("r", d.r).attr("cx", d.R)
                    .attr("cy", 0).attr("class", "planet")
                //     .on("mouseover", function (event, d) {
                //     console.log(d)
                // });
                // d3.select(this).append("g").attr("transform", "translate(" + d.R + ",0)")
                //     .selectAll("g.moon").data(d.moons).enter().append("g")
                //     .attr("class", "moon_cluster").each(function (d, i) {
                //     d3.select(this).append("circle").attr("class", "orbit")
                //         .attr("r", d.R);
                //     d3.select(this).append("circle").attr("r", d.r).attr("cx", d.R)
                //         .attr("cy", 0).attr("class", "moon");
                // })
                    .attr("transform", function (d) {
                        return "rotate(" + (d.phi0 + (vis.delta * (d.speed / 100))) + ")";
                    });
            })
            .attr("transform", function (d) {
                return "rotate(" + (d.phi0 + (vis.delta * (d.speed / 100))) + ")";
            })
        ;

// throttled rotaiton animations
        setInterval(function () {
            vis.delta = (Date.now() - vis.t0);
            vis.svg.selectAll(".planet_cluster, .moon_cluster").attr("transform", function (d) {
                return "rotate(" + (d.phi0 + (vis.delta * (d.speed / 100))) + ")";
            })

        }, 40);


    }
}// establish variables

