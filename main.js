"use strict";

var Spark    = require('spark');
var Doorbot  = require('./app/doorbot');
var Keen     = require('keen.io');
var Day      = require('./app/day');
var exec     = require('child_process').exec;
var Doorbell = require('./app/doorbell');
var Config   = require('./app/config');

// Initialise Configuration
Config.init(process.env.OIKOS_isResin ? Config.type.ENV : Config.type.FILE);

// Initialise Spark
console.log('Initialising Spark API');
Spark.login(Config.get('spark'));

// Initialise Keen
console.log('Initialising Keen');
var kClient = Keen.configure(Config.get('keen'));

// Set up the Day object with London location
var day = Day.instance();
day.init(51.5, -0.22);

// Set up time loops
setInterval(function() {
    day.check();
}, 10000); // 10 second polling

// Set the volume on the soundcard to 100% (using Alsa)
exec('amixer set PCM 100% unmute', function(err/*, stdout, stderr*/) {
    if(err) {
        console.error('main: unable to set volume - ' + err);
    }
});

// Setup Doorbot
console.log('Initialising Doorbot');
var db = Doorbot.create(Config.get('robots').doorbot.id, {doorbell: Doorbell.sounds[Config.get('robots').doorbot.bellType]});
db.subscribe('door:open', function() {
    var e = {
        door:   'front',
        status: 'open'
    };
    kClient.addEvent('door', e, function(err/*, res*/) {
        if(err) {
            console.error('Error transmitting event door:open');
        }
    });
});
db.subscribe('door:close', function() {
    var e = {
        door:   'front',
        status: 'closed'
    };
    kClient.addEvent('door', e, function(err/*, res*/) {
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
