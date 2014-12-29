var Spark = require('spark');
var Vent  = require('event.js');
var _     = require('lodash');

// Default options
var defaults = {
    events: ['door:open', 'door:close']
};

// Event mappings
var events = {
    'door:open':  'doorOpened',
    'door:close': 'doorClosed'
};

// Constructor
var Doorbot = function(device_id, options) {
    var self = this;
    this.o = _.defaults(options, defaults);

    // Event callback

    // setup events
    Spark.getDevice(device_id, function(err, device) {
        if(err) {
            throw new Error('Doorbot: unable to get device "' + device_id + '".');
        } else {
            for(var e in events) {
                var methodName = events[e];
                var eventName  = e;

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
    }
});

// Create method
Doorbot.create = function(device_id, options) {
    return new Doorbot(device_id, options || {});
};

module.exports = Doorbot;
