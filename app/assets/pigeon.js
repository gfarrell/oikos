var nodemailer = require('nodemailer');
var _          = require('lodash');
var Enum       = require('Enum');

var Pigeon = function(type) {
    type = type || Pigeon.type.EMAIL;
};

Pigeon.type = new Enum('EMAIL');

module.exports = Pigeon;
