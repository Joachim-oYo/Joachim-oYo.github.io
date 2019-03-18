// For JSON File



// DOM strings
var DOMStrings = {
    resultsList: '.results__list',

};



// ----------------------------------------------
// Data Handling
// ----------------------------------------------
function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'restaurants.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function init() {
    loadJSON(function (response) {
        // Parse JSON string into object
        var actual_JSON = JSON.parse(response);
        console.log(actual_JSON);
    });
}

// ----------------------------------------------
// UI Managing
// ----------------------------------------------
function updateRestaurantList(obj) {
    //    var element, html, newHtml;
    //    // Create HTML string with placeholder text
    //    element = DOMStrings.resultsList;
    //    html = '<div class="restaurant clearfix">%name% <div class="restaurant__votes">%votes%</div> <button class="vote__btn"><i class="ion-ios-close-outline"></i></button> </div>';
    //
    //    for (name in obj) {
    //        newHtml = html.replace('%name%', name);
    //        console.log(name+': '+name.votes);
    //        newHtml = newHtml.replace('%votes%', jsonFile[name].votes);
    //
    //        // Insert the HTML into the DOM
    //        dom.window.document.querySelector(element).insertAdjacentHTML('beforeEnd', newHtml);
    //        console.log(dom.window.document.querySelector(element).value);
    //    }
    console.log(obj);
}

init();
