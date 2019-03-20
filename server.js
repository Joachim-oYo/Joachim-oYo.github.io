// For REST and JSON
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
var fs = require("fs");
var jsonFileName = __dirname + '/public/data/restaurants.json';
var jsonFile = require(jsonFileName);
var id = 0;
var hasDelivery = false;

// ----------------------------------------------
// REST Functions and Helpers
// ----------------------------------------------
// Creates a restaurant object for the JSON file.
// If that restaurant already exists, adds 1 to
// its votes value.
function createRestaurant(resto_name) {
    var votes = 1;
    if (resto_name in jsonFile) {
        //        jsonFile[resto_name].votes++;
        votes = jsonFile[resto_name].votes + 1;
        id = jsonFile[resto_name].id;
        hasDelivery = jsonFile[resto_name].hasDelivery;
    }
    else {
        id = 1;
        for (resto_name in jsonFile) {
            id++;
        }
    }

    var restaurant = {
        "id": id,
        "votes": votes,
        "hasDelivery": hasDelivery
    }
    return restaurant;
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
app.post('/addRestaurant', urlencodedParser, function (req, res) {
    jsonFile[req.body.restaurant_name] = createRestaurant(req.body.restaurant_name);
    fs.writeFile(jsonFileName, JSON.stringify(jsonFile, null, 2), function (err) {
        if (err) return console.log(err);
        console.log('Updating ' + req.body.restaurant_name + ' and writing to ' + jsonFileName);
        console.log(JSON.stringify(jsonFile, null, 2));
        //        res.end(JSON.stringify(jsonFile, null, 2));
        res.sendFile(__dirname + "/" + "index.html");
    });
})

// On a POST to /addRestaurant, modify the 
// restaurants.json file depending on what was submitted
app.post('/setRestaurantDelivery', urlencodedParser, function (req, res) {
    jsonFile[req.body.restaurant_name].hasDelivery = req.body.has_delivery;
    
    fs.writeFile(jsonFileName, JSON.stringify(jsonFile, null, 2), function (err) {
        if (err) return console.log(err);
        res.sendFile(__dirname + "/" + "index.html");
    });
})

// On a GET to /listRestaurants, show the current
// state of the restaurants.json file.
app.get('/listRestaurants', function (req, res) {
    fs.readFile(jsonFileName, 'utf8', function (err, data) {
        data = JSON.stringify(JSON.parse(data), null, 2);
        console.log(data);
        res.end(data);
    });
})

// On a GET to /clearRestaurants, remove all of the
// restaurant objects from the restaurants.json file. 
app.get('/clearRestaurants', function (req, res) {
    jsonFile = {};
    fs.writeFile(jsonFileName, JSON.stringify(jsonFile, null, 2), function (err) {
        if (err) return console.log(err);
        console.log('Clearing JSON file at ' + jsonFileName);
        res.sendFile(__dirname + "/" + "index.html");
    });
})

// Initialize the server on the port defined in .env 
var server = app.listen(process.env.PORT || 1243, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("----------------");
    console.log("Lunch-Voting app listening at http://%s:%s", host, port)
    console.log("----------------");
})
