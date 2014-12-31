var _    = require('lodash');
var Enum = require('Enum');
require('string');

var __instance;

var Config = function(type) {
    type = type || Config.type.ENV;
    this.load(type);
};

Config.type = new Enum('ENV', 'FILE');

Config.instance = function() {
    return __instance;
};

Config.init = function(type) {
    if(__instance) throw new Error('Config::init: Config object has already been initialised.');

    __instance = new Config(type);
};

_.extend(Config.prototype, {
    load: function(type) {
        this.type = type;

        switch(type) {
            case Config.type.ENV:
                this.__cfg = process.env;
                break;
            case Config.type.FILE:
                this.__cfg = require('../.env.json');
                break;
        }
    },

    get: function(key) {
        return this.__cfg[key] || null;
    }
});

// Shortcut functions
Config.get = function(key) {
    return Config.instance().get(key);
};

module.exports = Config;
