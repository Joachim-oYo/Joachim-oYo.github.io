var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
var fs = require("fs");
var jsonFileName = __dirname + '/restaurants.json';
var jsonFile = require(jsonFileName);

var voteCount = 0;

var restaurantVotes = {};


//var restaurant = {
//    "restaurant4": {
//        "name": "Den Den",
//        "votes": 1,
//        "id": 4
//    }
//}

function createRestaurant(resto_name) {
    var votes = 1;
    if (resto_name in jsonFile) {
//        jsonFile[resto_name].votes++;
        votes = jsonFile[resto_name].votes + 1;
    }

    var restaurant = {
        "votes": votes
    }
    return restaurant;
}

app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

app.post('/addRestaurant', urlencodedParser, function (req, res) {
    console.log(req.body.restaurant_name);
    jsonFile[req.body.restaurant_name] = createRestaurant(req.body.restaurant_name);
    //    jsonFile.restaurant4 = restaurant["restaurant4"];
    fs.writeFile(jsonFileName, JSON.stringify(jsonFile, null, 2), function (err) {
        if (err) return console.log(err);
        //        console.log('writing to ' + jsonFileName);
        //        data = JSON.parse(data);
        //        console.log(JSON.stringify(jsonFile, null, 2));
        res.end(JSON.stringify(jsonFile, null, 2));
    });

    // First read existing users
    //    fs.readFile(jsonFileName, 'utf8', function (err, data) {
    //        //
    //    });

})

app.get('/listRestaurants', function (req, res) {
    fs.readFile(jsonFileName, 'utf8', function (err, data) {
        data = JSON.parse(data);
        console.log(data);
        res.end(JSON.stringify(data, null, 2));
    });
})

app.get('/:id', function (req, res) {
    // First read existing users.
    fs.readFile(jsonFileName, 'utf8', function (err, data) {
        var restaurants = JSON.parse(data);
        var restaurant = restaurants["restaurant" + req.params.id]
        console.log(restaurant);
        res.end(JSON.stringify(restaurant));
    });
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})
