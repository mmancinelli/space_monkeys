let launchData, rocketData, satelliteData, treeData, geoData, globeData, airportData
let launchVis, brushVis, networkVis, flightVis, costVis, orbitVis

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
	d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
	d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json")
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

	console.log(satelliteData);


	// orbitVis = new Orbitvis("orbitvis", data);
	orbitVis = new Orbitvis("orbit-vis", satelliteData, geoData);
	launchVis = new LaunchVis("world-map", launchData, geoData);
	brushVis   = new Brushvis("brush-plot", launchData);
	networkVis = new NetworkVis("network-vis", "networkLegend-vis",treeData);
	flightVis = new FlightVis("launches-vis", data);

}

function toggleButton(button) {
	if (document.getElementById("labelToggle").value == "OFF") {
		document.getElementById("labelToggle").value = "ON";
		// document.getElementById("labelToggle").class = "rgb(255,145,0)";
		networkVis.updateVis();

	} else if (document.getElementById("labelToggle").value == "ON") {
		document.getElementById("labelToggle").value = "OFF";
		// document.getElementById("labelToggle").style.background = "rgb(26,255,0)";
		networkVis.updateVis();
	}
}

var selectedCategory = $('#categorySelector').val();

function categoryChange() {
	selectedCategory = $('#categorySelector').val();
	networkVis.wrangleData();
}

function animateMap () {
	console.log("Button Pressed. Starting Animation");
	let animation_steps = 100;
	let step_delay      = 100; // [ms]

	// clear launches over time plot.
	brushVis.clip_path
		.attr("width", 0);

	//find min and max year
	let min_year = d3.min(brushVis.data, d => d.date).getFullYear();
	let max_year = d3.max(brushVis.data, d => d.date).getFullYear();

	//steps.forEach(function (d) {
	for (let ii = 1; ii <= animation_steps; ii++) {
		setTimeout(function() {
			let brush_width = brushVis.width / animation_steps * ii;
			brushVis.clip_path
				.transition()
				.ease(d3.easeLinear)
				.duration(step_delay)
				.attr("width", brush_width);
			mapvis_selectedTime = [min_year, (min_year + (max_year - min_year) / animation_steps * ii)];
			launchVis.wrangleData();
			console.log("wrangled " + ii + " with " + mapvis_selectedTime + " and width: " + brush_width);

		}, (ii * step_delay));
	}
}


