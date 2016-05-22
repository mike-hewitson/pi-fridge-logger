require('dotenv').config();
var sensorLib = require('node-dht-sensor');
var request = require('request');
var winston = require('winston');
var Papertrail = require('winston-papertrail').Papertrail;

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            json: false,
            expressFormat: true,
            colorize: true
        }),
        new winston.transports.Papertrail({
            host: 'logs4.papertrailapp.com',
            port: 32583, // your port here
            program: 'pi-logger',
            colorize: true
        })
    ]
});

var url = 'http://' + process.env.SERVER + ':' + process.env.PORT + '/readings';

// var options = {
//     host: process.env.SERVER + ':' + process.env.PORT + /readings,
//     path: '/readings',
//     method: 'POST'
// };

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
        var reading = { date: new Date(), sensors: [] };
        for (var a in this.sensors) {
            var b = sensorLib.readSpec(this.sensors[a].type, this.sensors[a].pin);
            reading.sensors.push({ sensor: this.sensors[a].name, temp: b.temperature.toFixed(1), hum: b.humidity.toFixed(1) });
        }
        logger.info(reading);
        // logger.info(uri);
        var req = {
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(reading)
        };
        // var req = {
        //     uri: uri,
        //     'content-type': 'application/json',
        //     body: JSON.stringify(reading)
        // };
        logger.info(req);

        // setTimeout(function() {
        //     sensor.read();
        // }, 2000);

        request(req, function(error, response, body) {
            // logger.info(error);
            // logger.info(response);
            // logger.info(body);
            if (response.statusCode == 201) {
                logger.info('document saved')
            } else {
                // logger.error(req);
                logger.error(response.statusCode);
                logger.error(body);
            }
        });

        // http.request(options, function(res) {
        //     console.log('STATUS: ' + res.statusCode);
        //     console.log('HEADERS: ' + JSON.stringify(res.headers));
        //     res.setEncoding('utf8');
        //     res.on('data', function(chunk) {
        //         console.log('BODY: ' + chunk);
        //     });
        // }).end();
    }
};

sensor.read();
