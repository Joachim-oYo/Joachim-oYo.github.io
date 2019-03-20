// For JSON File
var actual_JSON;


// DOM strings
var DOMStrings = {
    resultsList: '.results__list',
    voteButton: '.vote__btn'
};



// ----------------------------------------------
// Data Handling
// ----------------------------------------------
function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data/restaurants.json', true);
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
        actual_JSON = JSON.parse(response);
        updateRestaurantList(actual_JSON);
    });
}

function postAddRestaurant(message) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/addRestaurant', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    //    xhr.onreadystatechange = function () { // Call a function when the state changes.
    //        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
    //            alert(xhr.responseText);
    //        }
    //    }

    message = "restaurant_name=" + message;
    xhr.send(message);
}

function postSetDelivery(name, deliveryFlag) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/setRestaurantDelivery', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    //    xhr.onreadystatechange = function () { // Call a function when the state changes.
    //        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
    //            alert(xhr.responseText);
    //        }
    //    }
    var message = "";
    message = "restaurant_name=" + name + "&" + "has_delivery=" + deliveryFlag;
    xhr.send(message);
}


// ----------------------------------------------
// UI Managing
// ----------------------------------------------
function update() {
    
}


function updateRestaurantList(obj) {
    var element, html, newHtml;
    // Create HTML string with placeholder text
    element = DOMStrings.resultsList;
    html = '<div class="restaurant clearfix">%name% <div class="restaurant__votes" id="restaurant-%id%">%votes%</div> <div class="buttons"><button class="vote__btn" id="vote__btn-%id%"></button> <input type="checkbox" class="delivery__btn" id="delivery__btn-%id%" %delivery%><label class="delivery__lb" id="delivery__lb-%id%" for="delivery__btn-%id%">Is delivery available?</label></div></div>';



    for (let name in obj) {
        let restaurantVotes = obj[name].votes;
        let restaurantId = obj[name].id;
        let restaurantHasDelivery = obj[name].hasDelivery;
        let checkFlag = '';

        if (restaurantHasDelivery == 'true') {
            checkFlag = 'checked';
        }

        newHtml = html.replace('%name%', name);
        newHtml = newHtml.replace('%votes%', restaurantVotes);
        newHtml = newHtml.replace('%delivery%', checkFlag);
        newHtml = newHtml.replace('%id%', restaurantId);
        newHtml = newHtml.replace('%id%', restaurantId);
        newHtml = newHtml.replace('%id%', restaurantId);
        newHtml = newHtml.replace('%id%', restaurantId);
        newHtml = newHtml.replace('%id%', restaurantId);

        // Insert the HTML into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeEnd', newHtml);

        // Set the state of the delivery button based on the JSON file
        updateDeliveryCheckbox(restaurantId, restaurantHasDelivery);


        // Add an event listener for the buttons
        document.getElementById("vote__btn-" + restaurantId).addEventListener("click", function () {
            postAddRestaurant(name);
            document.getElementById('restaurant-' + restaurantId).innerHTML++;
        });
        document.getElementById("delivery__btn-" + restaurantId).addEventListener("click", function () {
            postSetDelivery(name, document.getElementById("delivery__btn-" + restaurantId).checked);
            updateDeliveryCheckbox(restaurantId, document.getElementById("delivery__btn-" + restaurantId).checked);
        });

    }
    console.log(obj);
}

function updateDeliveryCheckbox(idNum, deliveryFlag) {
    if (deliveryFlag == true || deliveryFlag == 'true') {
        document.getElementById("delivery__lb-" + idNum).textContent = 'Delivery is available!';
    }
    else
        document.getElementById("delivery__lb-" + idNum).textContent = 'Is delivery available?';
    
    console.log(deliveryFlag);
}

init();
update();
