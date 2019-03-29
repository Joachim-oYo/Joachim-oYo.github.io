// For JSON File
var lastSelectedVote;
var userVote;
let orderedKeys;

// DOM strings
var DOMStrings = {
    resultsList: '.results__list',
    voteButton: '.vote__btn'
};

// Initialize the default app
if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyBRLrlLUneGi7KNV6EHcBAT-jyVke2wMT8", // Auth / General Use
        authDomain: "lunch-voting.firebaseapp.com", // Auth with popup/redirect
        databaseURL: "https://lunch-voting.firebaseio.com", // Realtime Database
        storageBucket: "lunch-voting.appspot.com", // Storage
        messagingSenderId: "838589171936" // Cloud Messaging
    });
}
var database = firebase.database();
var restaurantsRef = database.ref('restaurants');
var usersRef = database.ref('users');
var restaurantData;
var users;
var ipAddress;
var underscoreString;

// ----------------------------------------------
// Firebase Functions and Handlers
// ----------------------------------------------
restaurantsRef.on("value", function (snapshot) {
    // Reorder based on votes
    restaurantsRef.orderByChild('votes').on("value", function (snapshot) {
        orderedKeys = [];
        snapshot.forEach(function (data) {
            orderedKeys.push(data.key);
        });
        orderedKeys.reverse();
    });

    restaurantData = snapshot.val();
    updateRestaurantList(restaurantData);

    console.log('Restaurants updated: ');
//    console.log(restaurantData);
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});
usersRef.on("value", function (snapshot) {
    users = snapshot.val();
    console.log('Users updated: ');
//    console.log(users);
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});


function init() {
    getIPAddress();
    usersRef.on('value', function (snapshot) {
        users = snapshot.val();

        underscoreString = ipAddress.replace('.', '_');
        underscoreString = underscoreString.replace('.', '_');
        underscoreString = underscoreString.replace('.', '_');
        userVote = users[underscoreString].votedFor;

        restaurantsRef.once('value', function (snapshot) {
            restaurantData = snapshot.val();
            updateRestaurantList(restaurantData);
            setupInputText();
        })
    })
}

function getIPAddress() {
    var xhr = new XMLHttpRequest();
    var url = "https://api.ipify.org";
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var result = this.responseText;
            ipAddress = result;
//            console.log(ipAddress);
            postLogIpAddress(ipAddress);
        }
    };

    xhr.open("GET", url, true);
    xhr.send();
}

function postLogIpAddress(message) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/logIpAddress', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    message = "ip_address=" + message;
    xhr.send(message);
}

function postAddRestaurant(message) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/addRestaurant', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    message = "restaurant_name=" + message;
    xhr.send(message);
}

function postPlaceVote(add_id, sub_id) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/placeVote', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var message = "";
    message = "ip_address=" + ipAddress + "&" + "add_to=" + add_id + "&" + "subtract_from=" + sub_id;
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

function updateRestaurantList(obj) {
    var element, html, newHtml;

    element = DOMStrings.resultsList;

    var resultsListElement = document.querySelector(element);
    resultsListElement.parentNode.removeChild(resultsListElement);
    var resultsContainerElement = document.getElementById('results-container');
    var newElement = document.createElement('div');
    newElement.setAttribute('class', 'results__list');
    resultsContainerElement.appendChild(newElement);

    //    document.querySelector(element).
    html = '<div id="added-restaurants" class="restaurant clearfix">%name% <div class="restaurant__votes" id="restaurant-%id%">%votes%</div> <div class="buttons"><div class="vote__btn" id="vote__btn-%id%"> <i id="i__vote-%id%"></i><span id="span__vote-%id%">voted!</span></div><input type="checkbox" class="delivery__btn" id="delivery__btn-%id%" %delivery%><label class="delivery__lb" id="delivery__lb-%id%" for="delivery__btn-%id%">Is delivery available?</label></div></div>';

    for (let id of orderedKeys) {
        let restaurantVotes = obj[id].votes;
        let restaurantName = obj[id].name;
        let restaurantId = id;
        let restaurantHasDelivery = obj[id].has_delivery;
        let checkFlag = '';

        if (restaurantHasDelivery == 'true') {
            checkFlag = 'checked';
        }

        newHtml = html.replace('%name%', restaurantName);
        newHtml = newHtml.replace('%votes%', restaurantVotes);
        newHtml = newHtml.replace('%delivery%', checkFlag);
        newHtml = newHtml.replace('%id%', restaurantId);
        newHtml = newHtml.replace('%id%', restaurantId);
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
        let voteBtn = document.getElementById("vote__btn-" + restaurantId);
        //        console.log(voteBtn);
        voteBtn.value = 'unselected';
        voteBtn.name = restaurantName;
        voteBtn.id = restaurantId;

//        console.log(restaurantId);
//        console.log(userVote);
        if (restaurantId == userVote) {
            voteBtn.value = 'selected';
            lastSelectedVote = voteBtn;
            document.getElementById("i__vote-" + restaurantId).classList.toggle("press");
            document.getElementById("span__vote-" + restaurantId).classList.toggle("press");
        }

        voteBtn.addEventListener("click", function () {
            if (voteBtn.value !== 'selected') {
                document.getElementById("i__vote-" + restaurantId).classList.toggle("press");
                document.getElementById("span__vote-" + restaurantId).classList.toggle("press");
                voteBtn.value = 'selected';
            }
            updateVoteSelection();
        });
        document.getElementById("delivery__btn-" + restaurantId).addEventListener("click", function () {
            postSetDelivery(restaurantId, document.getElementById("delivery__btn-" + restaurantId).checked);
            updateDeliveryCheckbox(restaurantId, document.getElementById("delivery__btn-" + restaurantId).checked);
        });
    }
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
                                if (el.value == 'selected') {
                                    if (el != lastSelectedVote) {
                                        // Unselect the old button
                                        lastSelectedVote.value = 'unselected';
                                        lastSelectedVote.childNodes[1].classList.toggle("press");
                                        lastSelectedVote.childNodes[2].classList.toggle("press");
                
                                        postPlaceVote(el.id, lastSelectedVote.id);
                                        document.getElementById('restaurant-' + lastSelectedVote.id).innerHTML--;
                                        document.getElementById('restaurant-' + el.id).innerHTML++;
                                        console.log('here');
                                    }
                                    lastSelectedVote = el;
                                }
            } else if (el.value == 'selected') {
                postPlaceVote(el.id, el.id);
                document.getElementById('restaurant-' + el.id).innerHTML++;
                lastSelectedVote = el;
            }
        }
    )
}


init();
//update();
