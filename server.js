// For REST and JSON
var express = require('express');
var client = require('redis').createClient(process.env.REDIS_URL);
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

// Get a database reference to our blog
var db = admin.database();
var restaurantsRef = db.ref("restaurants");

//var fs = require("fs");
//var jsonFileName = __dirname + '/public/data/restaurants.json';
//var jsonFile = require(jsonFileName);
var restaurantData; 
var id = 1;
var has_delivery = false;

// ----------------------------------------------
// REST Functions and Helpers
// ----------------------------------------------
// Creates a restaurant object for the JSON file.
// If that restaurant already exists, adds 1 to
// its votes value.

function createRestaurant(resto_name) {
    var votes = 0;
    if (resto_name in restaurantData) {
        //        jsonFile[resto_name].votes++;
        votes = restaurantData[resto_name].votes;
        id = restaurantData[resto_name].id;
        has_delivery = restaurantData[resto_name].has_delivery;
    } else {
        id = 1;
        for (resto_name in restaurantData) {
            console.log(resto_name);
            id++;
        }
    }

    var restaurant = {
        "id": id,
        "votes": votes,
        "has_delivery": has_delivery
    }
    return restaurant;
}

function updateRedis(redisId, obj) {
    client.set(redisId, JSON.stringify(obj));
}

//'restaurant-data'

async function retrieveRedis(redisId) {
    let prom = await new Promise((resolve, reject) => {
            client.get(redisId, async (err, reply) => err ? reject(err) : resolve(reply));
        })
        .then(async reply => {
            if (reply === null) return Promise.reject(null);
            const redisData = await JSON.parse(reply);
            return redisData;
        })
        .catch(() => Promise.reject({
            data: {}
        }));
    return prom;
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
    restaurantData[req.body.restaurant_name] = createRestaurant(req.body.restaurant_name);
    
    restaurantsRef.set({
        denden: {
            name: req.body.restaurant_name,
            votes: 1,
            has_delivery: false
        }
    })
    
    // Update the redis
    await updateRedis('restaurant-data', restaurantData);
    console.log('Redis Get Return');
    console.log('------------');
    console.log(await retrieveRedis('restaurant-data'));
    console.log('------------');

    console.log('Updated ' + req.body.restaurant_name);
    console.log('');
    console.log(JSON.stringify(restaurantData, null, 2));
    //        res.end(JSON.stringify(jsonFile, null, 2));
    res.sendFile(__dirname + "/" + "index.html");

})


app.post('/placeVote', urlencodedParser, function (req, res) {
    if (!(req.body.subtract_from == req.body.add_to)) {
        console.log('Removing one vote from ' + req.body.subtract_from);
        restaurantData[req.body.subtract_from].votes--;
    }

    console.log('Adding one vote to ' + req.body.add_to);
    console.log('');
    restaurantData[req.body.add_to].votes++;
    updateRedis('restaurant-data', restaurantData);

    res.sendFile(__dirname + "/" + "index.html");
})


app.post('/setRestaurantDelivery', urlencodedParser, function (req, res) {
    restaurantData[req.body.restaurant_name].has_delivery = req.body.has_delivery;
    updateRedis('restaurant-data', restaurantData)

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
    restaurantData = {};
    res.sendFile(__dirname + "/" + "index.html");
    updateRedis('restaurant-data', restaurantData);
    console.log('Cleared restaurantData');
    console.log('');
})

// Initialize the server on the port defined in .env 
var server = app.listen(process.env.PORT || 1243, async function () {
    var host = server.address().address
    var port = server.address().port
    console.log("----------------");
    console.log("Lunch-Voting app listening at http://%s:%s", host, port)
    console.log("----------------");
    console.log('Redis Initialization');
    console.log('------------');
    client.on('connect', async function () {
        console.log('connected');
        restaurantData = await retrieveRedis('restaurant-data');
        console.log('Initial data: ');
        console.log(restaurantData);
    });
    console.log('------------');
})
