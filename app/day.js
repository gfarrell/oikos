"use strict";

var SunCalc = require('suncalc');
var Vent    = require('event.js');
var Enum    = require('Enum');
var moment  = require('moment');
var _       = require('lodash');

var Day = function() {
    this.setPosition(0, 0);
};
var instance;

Day.status =  new Enum(
    'NIGHT',
    'SUNRISE',
    'DAY',
    'SUNSET'
);

Day.instance = function() {
    if(typeof instance === 'undefined') {
        instance = new Day();
    }

    return instance;
};

_.extend(Day.prototype, {
    init: function(lat, lan) {
        this.setPosition(lat, lan);
        this.update();
    },

    setPosition: function(lat, lan) {
        this.position = {
            lat: lat,
            lan: lan
        };
    },

    update: function() {
        this.times = SunCalc.getTimes(new Date(), this.position.lat, this.position.lan);
        this.updated = moment();
    },

    check: function() {
        var now = moment();

        var status, oldStatus = this.status;

        if(Math.abs(now.diff(this.times.sunrise, 'minutes')) < 15) {
            // in sunrise bracket
            status = Day.status.SUNRISE;
        } else if(Math.abs(now.diff(this.times.sunset, 'minutes')) < 15) {
            // in sunset bracket
            status = Day.status.SUNSET;
        } else if(now.isBefore(this.times.sunrise) || now.isAfter(this.times.sunset)) {
            status = Day.status.NIGHT;
        } else {
            status = Day.status.DAY;
        }

        this.status = status;

        if(oldStatus !== status) {
            this.publish('change', status, oldStatus);
        }

        if(Math.abs(now.diff(this.updated, 'hours')) > 23) {
            this.update();
        }
    }
});

Vent.implementOn(Day.prototype);

module.exports = Day;
