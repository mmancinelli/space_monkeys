

// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

let atmoVis, launchVis, networkVis, flightVis, costVis;

// (1) Load data with promises
let promises = [
    d3.csv("data/prepared_launch_data.csv"),
    d3.csv("data/prepared_rocket_data.csv"),
	d3.csv("data/prepared_satellite_data.csv"),
	d3.json("data/treeData.json"),
	d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_dendrogram.json") //practice data for the dendrogram
];

Promise.all(promises)
    .then( function(data){ createVis(data)})
    .catch( function (err){console.log(err)} );


	function createVis(data){

	// (2) Make our data look nicer and more useful
	allData = data;

	// console.log(allData);


	atmoVis = new AtmoVis("atmovis", allData);
	launchVis = new LaunchVis("launchvis", allData);
	networkVis = new NetworkVis("network-vis", allData,);
	flightVis = new FlightVis("flightvis", allData);
	costVis = new CostVis("costvis", allData);



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
