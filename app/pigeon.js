var config     = require('./config').get('comms');
var _          = require('lodash');
var Enum       = require('Enum');
var nodemailer = require('nodemailer');
var twilio     = require('twilio');

var Pigeon = function(type) {
    this.type = type || Pigeon.type.EMAIL;

    switch(type) {
        case Pigeon.type.EMAIL:
            this.transport = nodemailer.createTransport(config.email.settings);
            break;
        case Pigeon.type.SMS:
            this.transport = twilio(config.sms.twilio.account, config.sms.twilio.authToken);
            break;
    }
};

Pigeon.type = new Enum('EMAIL', 'SMS');

_.extend(Pigeon.prototype, {
    send: function(message, options, callback) {
        var defaultOptions = {
            subject:   'Message from Oikos',
            //recipient: 'recipient email/number/etc.'
        };
        options = _.defaults(options, defaultOptions);



        switch(this.type) {
            case Pigeon.type.EMAIL:
                this.transport.sendMail({
                    from: config.email.sender,
                    to: options.recipient || config.email.recipient,
                    subject: options.subject,
                    text: message
                }, function(err, info) {
                    if(err) {
                        console.error('Pigeon@send unable to send message: ' + err);
                    }

                    if(_.isFunction(callback)) callback(err, info);
                });
                break;
            case Pigeon.type.SMS:
                this.transport.messages.create({
                    from: config.sms.sender,
                    to: options.recipient || config.sms.recipient,
                    body: message
                }, function(err, message) {
                    if(err) {
                        console.error('Pigeon@send unable to send message: ' + err);
                    }
                });
                break;
        }
    }
});

module.exports = Pigeon;
