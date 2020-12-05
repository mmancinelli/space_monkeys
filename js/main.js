let launchData, rocketData, satelliteData, treeData, geoData, globeData
let launchVis, brushVis, networkVis, flightVis,  orbitSystem, mapBarVis

let countries = ["USA", "China", "Russia", "Japan", "Israel", "New Zealand", "Iran", "France", "India", "Mexico", "Kazakhstan", "North Korea","South Korea", "Brazil", "Kenya", "Australia"]

let countryColorScale = d3.scaleOrdinal()
	.range(["#0e3860", "#7431c4", "#9f0797", "#640345", "#800000", "#ee6666", "#ec7805", "#d49953", "#ffeb04", "#8eac07", "#364e05", "#0b3701","#0b3701", "#08e2b0", "#2f96e7", "#3559e0"])
	.domain(countries);

// init global time selction for map vis
let mapvis_selectedTime = []

// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y");
let dateParser = d3.timeParse("%m/%d/%y");

var gRange = d3
	.select('div#slider-range')
	.attr("class", "gRange")
	.append('svg')
	.attr('width', 500)
	.attr('height', 100)
	.append('g')
	.attr('transform', 'translate(30,30)');


// (1) Load data with promises
let promises = [
    d3.csv("data/prepared_launch_data.csv"),
    d3.csv("data/prepared_rocket_data.csv"), //we don't actually use this dataset, actually. :/
	d3.csv("data/prepared_satellite_data.csv"),
	d3.json("data/treeData.json"), //hierarchical version of launch_data
	d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
];

Promise.all(promises)
    .then( function(data){
    	// clean up satellite data for orbit vis
    	data[2].forEach(d=>{
    		// console.log(d)
    		d["Apogee"]=+d["Apogee (km)"];
			d["EL"]=+d["Expected Lifetime (yrs.)"];
			d["Period"]=+d["Period (minutes)"];
			d["LaunchMass"]=+d["Launch Mass (kg.)"];
			d["Country"] = d["Country of Operator/Owner"];
			d["Owner"]= d["Operator/Owner"];
			d["Purpose2"]=d["Purpose"];
			d["Date"] = dateParser(d["Date of Launch"]);

			let str=d.Country
			// console.log(str, str.includes('/'))
			if (d.Country != "USA" & d.Country != "China" & d.Country != "United Kingdom"& d.Country != "Russia" &d.Country != "Japan" & d.Country!= d.Country.includes("/") ){
				d.Country = "Other"
			}
			if (str.includes('/')==true){
				// console.log(d.Country.includes('/'))
				// console.log("here")
				d.Country = "Collaboration"
			}

			if (d.Purpose == "Communications" | d.Purpose == "Communications/Maritime Tracking" |d.Purpose == "Communications/Navigation" |d.Purpose == "Communications/Technology Development" ){
				d.Purpose = "Communications"
			} else if (d.Purpose == "Earth Observation" |d.Purpose == "Earth Observation/Communications" |d.Purpose == "Earth Observation/Communication/Space Science" |d.Purpose == "Earth Observation/Earth Science" |d.Purpose == "Earth Observation/Space Science" |d.Purpose == "Earth Observation/Technology Development" |d.Purpose == "Earth Science" |d.Purpose == "Earth Science/Earth Observation" |d.Purpose == "Earth/Space Observation") {
				d.Purpose = "Earth Science"
			} else if (d.Purpose == "Navigation/Global Positioning" |d.Purpose == "Navigation/Regional Positioning"){
				d.Purpose = "Navigation"
			} else if (d.Purpose == "Space Observation" |d.Purpose == "Space Science" |d.Purpose == "Space Science/Technology Demonstration" |d.Purpose == "Space Science/Technology Development"){
				d.Purpose = "Space Science"
			}
			else {
				d.Purpose = "Other"
			}

		})

		createVis(data)})
    .catch( function (err){console.log(err)} );


function createVis(data){

	// (2) Make our data look nicer and more useful
	launchData    = data[0];
	rocketData    = data[1];
	satelliteData = data[2];
	treeData      = data[3];
	geoData       = data[4];

	// instantiate visualization objects
	networkVis = new NetworkVis("network-vis", "networkLegend-vis",treeData);
	orbitSystem = new OrbitSystem("orbit-vis","orbitLegend-vis", satelliteData, geoData);
	launchVis = new LaunchVis("world-map", launchData, geoData);
	mapBarVis = new MapBarVis("world-bar", launchData, geoData);
	brushVis   = new Brushvis("brush-plot", launchData);
	flightVis = new FlightVis("launches-vis", "FlightLegend-vis", "FlightText", data);


	//loop through orbits after 10 seconds and continue for a few hours
	for (let ii = 0; ii <= 1000; ii++) {
		setTimeout(function () {
			orbitSystem.animate(20000, 1000);
		}, (ii * 20000));
	}
}

// label toggle for network vis
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
var selectedSatCategory = $('#satColor').val();
var selectedCountry = $('#countrySelector').val();
var selectedSpaceAge = $('#AgeSelector').val();
// var selectedCategory = $('#categorySelector').val();

function categoryChange() {
	selectedCategory = $('#categorySelector').val();

	networkVis.wrangleData();
}
// update color of satellites based on selection
function satCategoryChange(){

	orbitSystem.selectedSatCategory = $('#satColor').val();
	orbitSystem.updateLegend();
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
			mapBarVis.wrangleData();
			//console.log("wrangled " + ii + " with " + mapvis_selectedTime + " and width: " + brush_width);

			if (ii === animation_steps) {
				document.getElementById("map_animation").innerText = "Click and Drag Below to Explore";
			}
		}, (ii * step_delay));
	}
}

// for flight vis
function countryChange() {
	selectedCountry = $('#countrySelector').val();
	flightVis.wrangleData();
}

function AgeChange() {
	selectedSpaceAge = $('#AgeSelector').val();
	flightVis.wrangleData();
}


