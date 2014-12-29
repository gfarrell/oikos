var Spark   = require('spark');
var Doorbot = require('./app/doorbot');
var Keen    = require('keen.io');

// Initialise Spark
console.log('Initialising Spark API');
Spark.login({
    accessToken: process.env.SPARK_ACCESS_TOKEN
});

// Initialise Keen
console.log('Initialising Keen');
var kClient = Keen.configure({
    projectId: process.env.KEEN_PROJ_ID,
    writeKey:  process.env.KEEN_WRITE_KEY
});

// Setup Doorbot
console.log('Initialising Doorbot');
var db = Doorbot.create(process.env.DOORBOT_UUID);
db.subscribe('door:open', function() {
    kClient.addEvent('door', {'door': 'front', 'status': 'open'}, function(err, res) {
        if(err) {
            console.error('Error transmitting event door:open');
        }
    });
});
db.subscribe('door:close', function() {
    kClient.addEvent('door', {'door': 'front', 'status': 'closed'}, function(err, res) {
        if(err) {
            console.error('Error transmitting event door:close');
        }
    });
});
