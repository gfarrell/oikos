var Lame = require('lame');
var Speaker = require('speaker');
var Enum = require('Enum');
var _ = require('lodash');
var fs = require('fs');

var Doorbell = function(bellType) {
    bellType = bellType || Doorbell.sounds.STANDARD;

    this.type = bellType;
};

Doorbell.sounds = new Enum('STANDARD', 'OLD_FASHIONED', 'LARGE');

_.extend(Doorbell.prototype, {
    getFile: function() {
        var file;

        switch(this.type) {
            case Doorbell.sounds.LARGE:
                file = 'doorbell_large.mp3';
                break;
            case Doorbell.sounds.OLD_FASHIONED:
                file = 'doorbell_old_fashioned.mp3';
                break;
            case Doorbell.sounds.STANDARD:
            default:
                file = 'doorbell_standard.mp3';
                break;
        }

        return 'app/assets/sounds/' + file;
    },

    loadFile: function() {
        return fs.createReadStream(this.getFile());
    },

    play: function() {
        this.loadFile().pipe(new Lame.Decoder()).pipe(new Speaker());
    }
});

module.exports = Doorbell;
