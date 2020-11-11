

// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");


// (1) Load data with promises
let promises = [
    d3.csv("data/prepared_launch_data.csv"),
    d3.csv("data/prepared_rocket_data.csv")
];

Promise.all(promises)
    .then( function(data){ createVis(data)})
    .catch( function (err){console.log(err)} );


	function createVis(data){

	// (2) Make our data look nicer and more useful
	allData = data;

	// console.log(allData);


	let atmoVis = new AtmoVis("atmovis", allData);
	let launchVis = new LaunchVis("launchvis", allData);
	let networkVis = new NetworkVis("networkvis", allData,);
	let flightVis = new FlightVis("flightvis", allData);
	let costVis = new CostVis("costvis", allData);



}
