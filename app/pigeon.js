var config     = require('./config').get('comms');
var nodemailer = require('nodemailer');
var _          = require('lodash');
var Enum       = require('Enum');

var Pigeon = function(type) {
    this.type = type || Pigeon.type.EMAIL;

    switch(type) {
        case Pigeon.type.EMAIL:
            this.transport = nodemailer.createTransport(config.settings);
            break;
    }
};

Pigeon.type = new Enum('EMAIL');

_.extend(Pigeon.prototype, {
    send: function(message, subject, callback) {
        subject = subject || 'Message from Oikos';

        switch(this.type) {
            case Pigeon.type.EMAIL:
                this.transport.sendMail({
                    from: config.sender,
                    to: config.recipient,
                    subject: subject,
                    text: message
                }, function(err, info) {
                    if(err) {
                        console.error('Pigeon@send unable to send message: ' + err);
                    }

                    if(_.isFunction(callback)) callback(err, info);
                });
                break;
        }
    }
});

module.exports = Pigeon;
