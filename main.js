var Spark    = require('spark');
var Doorbot  = require('./app/doorbot');
var Keen     = require('keen.io');
var Day      = require('./app/day');
var exec     = require('child_process').exec;
var Doorbell = require('./app/doorbell');

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

// Set up the Day object with London location
var day = Day.instance();
day.init(51.5, -0.22);

// Set up time loops
setInterval(function() {
    day.check();
}, 10000); // 10 second polling

// Set the volume on the soundcard to 100% (using Alsa)
exec('amixer set PCM 100% unmute', function(err, stdout, stderr) {
    if(err) {
        console.error('main: unable to set volume - ' + err);
    }
});

// Setup Doorbot
console.log('Initialising Doorbot');
var db = Doorbot.create(process.env.DOORBOT_UUID, {doorbell: Doorbell.sounds[process.env.DOORBELL_TYPE]});
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

// On sunset/sunrise change light status
day.subscribe('change', function(status) {
    switch(status) {
        case Day.status.SUNRISE:
        case Day.status.DAY:
            db.setLightState(false);
            break;
        case Day.status.SUNSET:
        case Day.status.NIGHT:
            db.setLightState(true);
            break;
    }
});
