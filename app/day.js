var SunCalc = require('suncalc');
var Vent    = require('event.js');
var Enum    = require('Enum');
var moment  = require('moment');

var DayStatus = new Enum(
    'NIGHT',
    'SUNRISE',
    'DAY',
    'SUNSET'
);

var Day = {
    init: function(lat, lang) {
        this.position = {
            lat: lat,
            lan: lan
        };

        this.updateCalculations();
    },

    updateCalculations: function() {
        this.times = SunCalc.getTimes(new Date(), this.location.lat, this.location.lan);
        this.updated = moment();
    },

    check: function() {
        var now = moment();

        var status, oldStatus = this.status;

        if(Math.abs(now.diff(this.times.sunrise, 'minutes')) < 15) {
            // in sunrise bracket
            status = DayStatus.SUNRISE;
        } else if(Math.abs(now.diff(this.times.sunset, 'minutes')) < 15) {
            // in sunset bracket
            status = DayStatus.SUNSET;
        } else if(now.isBefore(this.times.sunrise) || now.isAfter(this.times.sunset)) {
            status = DayStatus.NIGHT;
        } else {
            status = DayStatus.DAY;
        }

        this.status = status;

        if(oldStatus != status) {
            this.publish('change', status, oldStatus);
        }

        if(Math.abs(now.diff(this.updated, 'hours')) > 23) {
            this.updateCalculations();
        }
    },

    DayStatus: DayStatus
};

Vent.implementOn(Day);

module.exports = Day;
