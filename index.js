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

// var sensor = {
//     initialize: function() {
//         return sensorLib.initialize(22, 4);
//     },
//     read: function() {
//         var readout = sensorLib.read();
//         logger.info('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
//             'humidity: ' + readout.humidity.toFixed(2) + '%');
//         setTimeout(function() {
//             sensor.read();
//         }, 2000);
//     }
// };

// if (sensor.initialize()) {
//     sensor.read();
// } else {
//     logger.warn('Failed to initialize sensor');
// }

var sensorLib = require("node-dht-sensor");

var sensor = {
    sensors: [{
        name: "Ambient",
        type: 22,
        pin: 4
    }, {
        name: "Curing",
        type: 22,
        pin: 25
    }, {
        name: "Fridge",
        type: 22,
        pin: 24
    }],
    read: function() {
        var reading = { date: new Date(), sensors: []};
        for (var a in this.sensors) {
            var b = sensorLib.readSpec(this.sensors[a].type, this.sensors[a].pin);
            reading.sensors.push({sensor: this.sensors[a], temp: b.temperature.toFixed(1), hum: b.humidity.toFixed(1)});
            logger.info(this.sensors[a].name + ": " +
                b.temperature.toFixed(1) + "C, " +
                b.humidity.toFixed(1) + "%");
        }
        logger.info(reading);
        setTimeout(function() {
            sensor.read();
        }, 2000);
    }
};

sensor.read();
