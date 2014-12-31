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
    if(__instance && instance.type != type) throw new Error('Config::init: Config object has already been initialised with a different type.');

    __instance = new Config(type);

    return Config;
};

_.extend(Config.prototype, {
    load: function(type) {
        this.type = type;
        this.__cfg = {};

        switch(type) {
            case Config.type.ENV:
                for(var key in process.env) {
                    // only want env variables starting with OIKOS_
                    if(key.indexOf('OIKOS_') !== 0) continue;

                    // namespaces separated by "_"
                    var parts = key.split('_');
                    var dest = this.__cfg;
                    var k;

                    // Remove the OIKOS namespace
                    parts.shift();

                    while(parts.length > 1) {
                        k = parts.shift();
                        // create namespace if doesn't exist
                        if(!_.has(dest, k)) {
                            dest[k] = {};
                        } else {
                            // throw an error if this is not a namespace but a final value
                            if(!_.isPlainObject(dest[k])) throw new Error('Config@load: ' + _.first(key.split('_'), parts.length + 1).join('.') + ' is not a namespace but of type ' + (typeof dest[k]) + '.');
                        }

                        dest = dest[k];
                    }

                    dest[parts[0]] = process.env[key];
                }
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
