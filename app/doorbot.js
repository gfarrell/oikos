"use strict";

var Spark    = require('spark');
var Vent     = require('event.js');
var _        = require('lodash');
var Doorbell = require('./doorbell');

// Default options
var defaults = {
    events:   ['door:open', 'door:close', 'doorbell'],
    doorbell: Doorbell.sounds.OLD_FASHIONED
};

// Event mappings
var events = {
    'door:open':  'doorOpened',
    'door:close': 'doorClosed',
    'doorbell':   'playDoorbell'
};

// Constructor
var Doorbot = function(deviceId, options) {
    var self = this;
    this.o = _.defaults(options, defaults);

    this.uuid = deviceId;

    // Setup doorbell
    this.bell = new Doorbell(this.o.doorbell);

    // setup events
    Spark.getDevice(deviceId, function(err, device) {
        if(err) {
            throw new Error('Doorbot: unable to get device "' + deviceId + '".');
        } else {
            for(var e in events) {
                if(_.contains(self.o.events, e)) {
                    device.subscribe(e, self.sparkEvent.bind(self));
                }
            }
        }
    });
};

// Events setup
Vent.implementOn(Doorbot.prototype);

// Methods
_.extend(Doorbot.prototype, {
    sparkEvent: function(data) {
        var eventName  = data.name;
        var methodName = events[eventName];
        var callback   = this[methodName];

        console.log('Doorbot@sparkEvent: received ' + eventName + '.');

        if(_.isFunction(callback)) {
            callback.call(this, data);
        }

        this.publish(eventName, data);
    },

    doorOpened: function() {
        console.warn('Doorbot@doorOpened: not implemented.');
    },

    doorClosed: function() {
        console.warn('Doorbot@doorClosed: not implemented.');
    },

    playDoorbell: function() {
        this.bell.play();
    },

    setLightState: function(state) {
        var self = this;
        state = state || false;

        Spark.getDevice(this.uuid, function(err, device) {
            if(err) {
                throw new Error('Doorbot@setLightState: failed to get device ' + self.uuid);
            } else {
                device.callFunction('lights', (state ? 'on' : 'off'), function(err/*, data*/) {
                    if(err) {
                        throw new Error('Doorbot@setLightState: failed to set light state.');
                    }
                });
            }
        });
    }
});

// Storage
var doorbots = {};

// Create method
Doorbot.create = function(deviceId, options) {
    if(!(_.has(doorbots, deviceId) && doorbots[deviceId] instanceof Doorbot)) {
        doorbots[deviceId] = new Doorbot(deviceId, options || {});
    }

    return doorbots[deviceId];
};

module.exports = Doorbot;
