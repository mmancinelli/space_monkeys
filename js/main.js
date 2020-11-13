let launchData, rocketData, satelliteData, treeData, geoData
let launchVis, brushVis, networkVis, flightVis, atmoVis, costVis

// init global time selction for map vis
let mapvis_selectedTime = []

// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");


// (1) Load data with promises
let promises = [
    d3.csv("data/prepared_launch_data.csv"),
    d3.csv("data/prepared_rocket_data.csv"),
	d3.csv("data/prepared_satellite_data.csv"),
	d3.json("data/treeData.json"),
	d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
];

Promise.all(promises)
    .then( function(data){ createVis(data)})
    .catch( function (err){console.log(err)} );


function createVis(data){

	// (2) Make our data look nicer and more useful
	launchData    = data[0];
	rocketData    = data[1];
	satelliteData = data[2];
	treeData      = data[3];
	geoData       = data[4];

	// console.log(allData);


	//let atmoVis = new AtmoVis("orbit-vis", allData);
	launchVis = new LaunchVis("world-map", launchData, geoData);
	brushVis   = new Brushvis("brush-plot", launchData);
	//let networkVis = new NetworkVis("network-vis", allData,);
	//let flightVis = new FlightVis("launches-vis", allData);
	//let costVis = new CostVis("costvis", allData);



}
