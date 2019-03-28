// For REST and JSON
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})

//Firebase
// Import Admin SDK
var admin = require("firebase-admin");
var serviceAccount = require(__dirname + '/private/lunch_voting_key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://lunch-voting.firebaseio.com'
});

// Get a database reference to our blog
var db = admin.database();
var restaurantsRef = db.ref('restaurants');
var usersRef = db.ref('users');

var restaurantData;
var users;
var id = 1;
var has_delivery = false;

// ----------------------------------------------
// REST Functions and Helpers
// ----------------------------------------------
// Creates a restaurant object for the JSON file.
// If that restaurant already exists, adds 1 to
// its votes value.

function createRestaurant(resto_name) {
    var restaurantInDatabase;
    restaurantsRef.orderByChild('name').equalTo(resto_name).once("value", snapshot => {
        restaurantInDatabase = snapshot.exists();
    });


    if (restaurantInDatabase) {
        console.log(resto_name + ' is already in the database.');
    } else {
        restaurantsRef.push({
            name: resto_name,
            votes: 0,
            has_delivery: false
        });
        console.log('Added ' + resto_name + ' to the database.');
    }
}

// Serve up index.html for the homepage
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

// Also serve up index.html if someone tries to
// GET /addRestaurant after the POST to that
// endpoint is made.
app.get('/addRestaurant', function (req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

// On a POST to /addRestaurant, modify the 
// restaurants.json file depending on what was submitted
app.post('/addRestaurant', urlencodedParser, async function (req, res) {
    createRestaurant(req.body.restaurant_name);
    res.sendFile(__dirname + "/" + "index.html");
})


app.post('/placeVote', urlencodedParser, function (req, res) {
    console.log(req.body.add_to);

    if (!(req.body.subtract_from == req.body.add_to)) {
        console.log('Removing one vote from ' + req.body.subtract_from);
        restaurantsRef.child(req.body.subtract_from).update({
            votes: restaurantData[req.body.subtract_from].votes - 1
        });
    }

    console.log('Adding one vote to ' + req.body.add_to);
    console.log('');
    restaurantsRef.child(req.body.add_to).update({
        votes: restaurantData[req.body.add_to].votes + 1
    });
    //    usersRef.child(req.bodyupdate({
    //        req.body.add_to: 
    //    });


    res.sendFile(__dirname + "/" + "index.html");
})


app.post('/setRestaurantDelivery', urlencodedParser, function (req, res) {
    restaurantsRef.child(req.body.restaurant_name).update({
        has_delivery: req.body.has_delivery
    });

    restaurantData[req.body.restaurant_name].has_delivery = req.body.has_delivery;
    res.sendFile(__dirname + "/" + "index.html");
})

// On a GET to /listRestaurants, show the current
// state of the restaurants.json file.
app.get('/listRestaurants', async function (req, res) {
    res.end(JSON.stringify(restaurantData, null, 2));
})

// On a GET to /clearRestaurants, remove all of the
// restaurant objects from the restaurants.json file. 
app.get('/clearRestaurants', function (req, res) {
    restaurantsRef.once('value', function (snapshot) {
        snapshot.forEach(function (_child) {
            restaurantsRef.child(_child.key).remove();
        })
    })
    console.log('Cleared database');
    console.log('');
    res.sendFile(__dirname + "/" + "index.html");
})


app.post('/logIpAddress', urlencodedParser, function (req, res) {
    var userInDatabase;
    var address = req.body.ip_address;
    var underscoreString = address.replace('.', '_');
    var underscoreString = underscoreString.replace('.', '_');
    var underscoreString = underscoreString.replace('.', '_');

    usersRef.once('value', function (snapshot) {
        userInDatabase = snapshot.hasChild(underscoreString);
        console.log(userInDatabase);
    });

    if (!userInDatabase) {
        usersRef.child(underscoreString).set({
            votedFor: 'NO_VOTE_YET'
        });
    }

    res.sendFile(__dirname + "/" + "index.html");
})


// Initialize the server on the port defined in .env 
var server = app.listen(process.env.PORT || 1243, async function () {
    var host = server.address().address
    var port = server.address().port
    console.log("----------------");
    console.log("Lunch-Voting app listening at http://%s:%s", host, port)
    console.log("----------------");

    restaurantsRef.once("value", function (snapshot) {
        restaurantData = snapshot.val();
        if (restaurantData == null)
            restaurantData = {};
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    usersRef.once("value", function (snapshot) {
        users = snapshot.val();
        if (users == null)
            users = {};
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
})

// ----------------------------------------------
// Firebase Functions and Handlers
// ----------------------------------------------
restaurantsRef.on("value", function (snapshot) {
    restaurantData = snapshot.val();
    if (restaurantData == null)
        restaurantData = {};
    console.log('Update to restaurants: ');
    console.log(restaurantData);
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});


usersRef.on("value", function (snapshot) {
    users = snapshot.val();
    if (users == null)
        users = {};
    console.log('Update to users: ');
    console.log(users);
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});
