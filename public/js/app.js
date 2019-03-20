// For JSON File
let actual_JSON;
var lastSelectedVote;

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

    setupInputText();
}

console.log(actual_JSON);

function postAddRestaurant(message) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/addRestaurant', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    message = "restaurant_name=" + message;
    xhr.send(message);
}

function postPlaceVote(add_name, sub_name) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/placeVote', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var message = "";
    message = "add_to=" + add_name + "&" + "subtract_from=" + sub_name;
    xhr.send(message);
}

function postSetDelivery(name, deliveryFlag) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/setRestaurantDelivery', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var message = "";
    message = "restaurant_name=" + name + "&" + "has_delivery=" + deliveryFlag;
    xhr.send(message);
}


// ----------------------------------------------
// UI Managing
// ----------------------------------------------
function setupInputText() {
    const setActive = (el, active) => {
        const formField = el.parentNode.parentNode
        if (active) {
            formField.classList.add('form-field--is-active')
        } else {
            formField.classList.remove('form-field--is-active')
            el.value === '' ?
                formField.classList.remove('form-field--is-filled') :
                formField.classList.add('form-field--is-filled')
        }
    }

[].forEach.call(
        document.querySelectorAll('.form-field__input, .form-field__textarea'),
        (el) => {
            el.onblur = () => {
                setActive(el, false)
            }
            el.onfocus = () => {
                setActive(el, true)
            }
        }
    )
}

function update() {

}


function updateRestaurantList(obj) {
    var element, html, newHtml;
    // Create HTML string with placeholder text
    element = DOMStrings.resultsList;
    html = '<div class="restaurant clearfix">%name% <div class="restaurant__votes" id="restaurant-%id%">%votes%</div> <div class="buttons"><input type="radio" name="%name%" class="vote__btn" id="vote__btn-%id%"> <input type="checkbox" class="delivery__btn" id="delivery__btn-%id%" %delivery%><label class="delivery__lb" id="delivery__lb-%id%" for="delivery__btn-%id%">Is delivery available?</label></div></div>';



    for (let name in obj) {
        let restaurantVotes = obj[name].votes;
        let restaurantId = obj[name].id;
        let restaurantHasDelivery = obj[name].hasDelivery;
        let checkFlag = '';

        if (restaurantHasDelivery == 'true') {
            checkFlag = 'checked';
        }

        newHtml = html.replace('%name%', name);
        newHtml = newHtml.replace('%name%', name);
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
            updateVoteSelection();
        });
        document.getElementById("delivery__btn-" + restaurantId).addEventListener("click", function () {
            postSetDelivery(name, document.getElementById("delivery__btn-" + restaurantId).checked);
            updateDeliveryCheckbox(restaurantId, document.getElementById("delivery__btn-" + restaurantId).checked);
        });

    }
    //    console.log(obj);
}

function updateDeliveryCheckbox(idNum, deliveryFlag) {
    if (deliveryFlag == true || deliveryFlag == 'true') {
        document.getElementById("delivery__lb-" + idNum).textContent = 'Delivery is available!';
    } else
        document.getElementById("delivery__lb-" + idNum).textContent = 'Is delivery available?';
}

function updateVoteSelection() {
    [].forEach.call(
        document.querySelectorAll('.vote__btn'),
        (el) => {
            if (!(lastSelectedVote == null)) {
                if (el.checked) {
                    if (el != lastSelectedVote) {
                        lastSelectedVote.checked = false;
                        postPlaceVote(el.name, lastSelectedVote.name);
                        let lastEndChar = lastSelectedVote.id[lastSelectedVote.id.length - 1];
                        document.getElementById('restaurant-' + lastEndChar).innerHTML--;
                        let elEndChar = el.id[el.id.length - 1];
                        console.log(document.getElementById('restaurant-' + elEndChar).innerHTML);
                        document.getElementById('restaurant-' + elEndChar).innerHTML++;
                        console.log(document.getElementById('restaurant-' + elEndChar).innerHTML);
                    }
                    lastSelectedVote = el;
                }
            } else if (el.checked) {
                postPlaceVote(el.name, el.name);
                let elEndChar = el.id[el.id.length - 1];
                document.getElementById('restaurant-' + elEndChar).innerHTML++;
                lastSelectedVote = el;
            }
        }
    )
    //    loadJSON(function (response) {
    //        // Parse JSON string into object
    //        actual_JSON = JSON.parse(response);
    //        updateRestaurantList(actual_JSON);
    //    });
}


init();
update();
