/*
 * treedata.js - Code to reorganize flat csv prepared_launch_data into hierarchical array
 *                  for the radial dendrogram visualization
 * author: Zane
 * date created: 11/09/2020
 * date last modified: 11/18/2020
 * product: a stringified json array of the data in hierarchical form.
 *          Which was then copied and pasted into a .json file because exporting files in this framework is stupid.
 */


// loadData();

var totalLaunches=[];
var successRatiosList=[];

function loadData() {
    d3.csv("data/prepared_launch_data.csv").then(csv => {

        // since the country data seems a bit weird (Florida, California, and US are all independent entries)
        // extracting the actual country from the location of launch
        var rowID=0;
        csv.forEach((d, i) => {
            // d["CountryName"] = splitWords(d.Location)
            if (d.CompanyName=="CASC"){
                d.Country="China";
            } else if (d.CompanyName =="SRC" | d.CompanyName == "Sea Launch"){
                d.Country = "Russia";
            } else if (d.Country =="Korea"){
                d.Country = "North Korea";
            } else if (d.CompanyName =="IRGC"){
                d.Country = "Iran";
            }else if (d.Country =="Florida"){
                d.Country = "USA";
            }else if (d.Country =="California"){
                d.Country = "USA";
            }else if (d.Country =="Zealand"){
                d.Country = "New Zealand";
            }else if (d.Country =="Facility"){
                d.Country = "USA"
            }else if (d.Country =="Canaria"){
                d.Country = "USA"
            }else if (d.CompanyName =="Kosmotras"| d.CompanyName =="Land Launch"|d.CompanyName =="OKB-586"|d.CompanyName =="Roscosmos"|d.CompanyName =="RVSN USSR"|d.CompanyName =="Starsem"|d.CompanyName =="VKS RF"|d.CompanyName =="Yuzhmash"){
                d.Country = "Russia"
            }else if (d.CompanyName =="Arianespace"){
                d.Country = "France"
            }else if (d.CompanyName =="ULA"){
                d.CompanyName = "Boeing"
            } else if (d.Country == "Kazakhstan"){
                d.Country = "Russia"
            }
        })

        // console.log(rowID, csv[rowID])
        // csv.splice(0,rowID)

        //replace incorrect countries


        // different groupings
        // apparently you can group by multiple levels. Sweet!
        // let byRocketCategory = d3.group(csv, d => d.Rocket_Category);
        // let byCompany = d3.group(csv, d => d.CompanyName);
        let byCompanyRocket = d3.group(csv, d => d.Country, d => d.CompanyName, d => d.Rocket_Category);

        // for some reason, byCompanyRocket outputs asynchronously as the finished product.
        // making an unused duplicate to compare/contrast final product
        let byCountryCompanyRocket = d3.group(csv, d => d.Country, d => d.CompanyName, d => d.Rocket_Category);
        // console.log(byCountryCompanyRocket)


        // moved these sections of code to their own functions below

        // need to summarize data by rocket type
        let rocketData = summarizeData(byCompanyRocket);
        // console.log(rocketData);


        // replace info for each rocket with info collected in rocketdata
        let nestedMapObject = replaceData(byCompanyRocket, rocketData);
        // console.log(nestedMapObject)


        // need to convert map object into array
        let finalArray = arrayifyData(nestedMapObject);
        // console.log("final array", finalArray)

        let finalTree=[];
        finalTree = {name: "Rockets", children: finalArray}

        // console.log(finalTree)

        let finalJSON = JSON.stringify(finalTree);
        // console.log(finalJSON);


        // write to file
        // fs.writeFile ("data/treeData.json", JSON.stringify(finalArray), function(err) {
        //         if (err) throw err;
        //         console.log('complete');
        //     }
        // );



    })
}
function arrayifyData(data){
    let countryArray = [];
    for (let [key, value] of data) {
        let companyArray = [];
        for (let [key2, value2] of value) {
            let rocketArray = [];
            for (let [key3, value3] of value2){
                // console.log(key3)
                rocketArray.push({
                    name: key3,
                    information: value3
                })
            }
            companyArray.push({
                name: key2,
                children: rocketArray
            })
        }
        countryArray.push({
            name: key,
            children: companyArray
        })
    }
    return countryArray;

}
function replaceData(data, rocketdata){
    for (let [key,value] of data){
        myCountryName = key;
        for (let [key2,value2] of value){
            myCompanyName = key2
            for (let [key3, value3] of value2){
                myRocketName = key3;
                myArray =data.get(myCountryName).get(myCompanyName)
                rocketdata.forEach((d,i)=> {
                    // console.log(d)
                    if (d.name==myRocketName & d.company ==myCompanyName){
                        myArray.set(myRocketName, d)
                    }
                })
            }
        }
    }
    return data;
}
function summarizeData(data){
    let rocketdata=[];
    var successRatioArray=[];

    data.forEach((d, i) => {
        // d returns a map of all companies in country


        d.forEach((d, i) => {
            // d is a map of all rockets per company

            // set up counters to collect data


            d.forEach((d, i) => {
                // d is an array of all rocket launches per rocket
                var rocketName, rocketStatus, companyName, country;
                var rocketCounter = 0;
                var successCounter = 0;
                var failureCounter = 0;
                var successratio = 0;


                var date= '';

                // collect information for each rocket
                rocketStatus = "StatusRetired";
                d.forEach((d, i) => {
                    // d is every single rocket launch for each rocket type

                    rocketName = d.Rocket_Category;
                    if (d.StatusRocket=="StatusActive"){
                        rocketStatus = "StatusActive"
                    }

                    companyName = d.CompanyName;
                    countryName = d.Country;
                    date = d.Datum;
                    rocketCounter++;

                    // console.log(rocketName, rocketStatus)

                    // count number of successes and failures per rocket type
                    if (d.StatusMission == "Success") {
                        successCounter++;
                    } else {
                        failureCounter++;
                    }
                })


                let successRatio = (successCounter / rocketCounter * 100).toFixed(1)
                successRatioArray.push({
                    name: rocketName,
                    ratio: successRatio
                })
                successRatiosList.push(successRatio)
                totalLaunches.push(rocketCounter)
                // push collected information to rocketData
                // length: 182
                // one entry for each rocket type
                rocketdata.push({
                    name: rocketName,
                    status: rocketStatus,
                    failures: failureCounter,
                    successes: successCounter,
                    country: countryName,
                    company: companyName,
                    total: rocketCounter,
                    date: date,
                    successRatio:successRatio
                })
            })

        })
    })

    // console.log(d3.sum(totalLaunches))
    console.log(d3.mean(successRatiosList))
    return rocketdata;

}
function splitWords(location){
    var n = location.split(", ")
    return n[n.length-1]
}
