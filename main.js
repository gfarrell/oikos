var Spark = require('spark');
var Doorbot = require('./app/doorbot');

// Initialise Spark
console.log('Initialising Spark API');
Spark.login({
    accessToken: process.env.SPARK_ACCESS_TOKEN
});

// Setup Doorbot
console.log('Initialising Doorbot');
var db = Doorbot.create(process.env.DOORBOT_UUID);
db.subscribe('door:open', function() {
    console.log('Door opened!');
});
db.subscribe('door:close', function() {
    console.log('Door closed!');
});
