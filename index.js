require('dotenv').config();
var sensorLib = require('node-dht-sensor');
var winston = require('winston');
var Papertrail = require('winston-papertrail').Papertrail;

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            json: true,
            expressFormat: true,
            colorize: true
        }),
        new winston.transports.Papertrail({
            host: 'logs4.papertrailapp.com',
            port: 32583, // your port here
            program: 'rest-server',
            colorize: true
        })
    ]
});

var sensor = {
    initialize: function() {
        return sensorLib.initialize(22, 4);
    },
    read: function() {
        var readout = sensorLib.read();
        logger.info('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
            'humidity: ' + readout.humidity.toFixed(2) + '%');
        setTimeout(function() {
            sensor.read();
        }, 2000);
    }
};

if (sensor.initialize()) {
    sensor.read();
} else {
    console.warn('Failed to initialize sensor');
}
