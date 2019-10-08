"use strict";

require('dotenv').config();
var sensorLib = require('node-dht-sensor');
var request = require('request');
var winston = require('winston');
var Papertrail = require('winston-papertrail').Papertrail;

var myLogger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            json: false,
            expressFormat: true,
            colorize: true
        }),
        new winston.transports.Papertrail({
            host: 'logs.papertrailapp.com',
            port: 52747,
            program: 'pi-logger',
            colorize: true
        })
    ]
});

// Old sensor configuration
var oldSensorArray = [{
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
    }];

var url = 'http://' + process.env.SERVER + ':' + process.env.PORT + '/readings';

var sensor = {
    sensors: [{
        name: "Curing",
        type: 22,
        pin: 4
    }],
    read: function() {
        var options = {
            exclude: 'hourly,daily,flags',
            units: 'si'
        };

        var reading = { date: new Date(), sensors: [] };
        var valid_readings = true;
        for (var a in sensor.sensors) {
            var b = sensorLib.readSpec(sensor.sensors[a].type, sensor.sensors[a].pin);

            if ((b.temperature !== 0 && b.humidity !== 0) &&
                (b.temperature > 0 && b.temperature < 40) &&
                (b.humidity > 50 && b.humidity < 101)) {
                reading.sensors.push({ sensor: sensor.sensors[a].name, temp: b.temperature.toFixed(1), hum: b.humidity.toFixed(1) });
            } else {
                valid_readings = false;
                myLogger.warn('Bad reading :' + JSON.stringify(sensor.sensors[a]) + ':' + JSON.stringify(b));
            }
        }

        if (valid_readings) {
//            myLogger.debug(reading);

//            var req = {
//                url: url,
//                method: "POST",
//                headers: {
//                    "content-type": "application/json"
//                },
//                json: reading
//            };

//            myLogger.info(req);

//            request(req, function(error, response, body) {
//                if (response.statusCode === 201) {
//                    myLogger.info('document saved');
//                } else {
//                    myLogger.error(response.statusCode);
//                    myLogger.error(body);
//                }
//            });

//           test one with fake data
//            myLogger.debug(reading);

            var url2 = 'https://' + process.env.SERVER + '/collector.php?s=Curing&t=' + reading.sensors[0].temp + '&h=' + reading.sensors[0].hum;

            var req = {
                url: url2,
                method: "POST",
//                headers: {
//                    "content-type": "application/json"
//                },
            };

            myLogger.debug(req);

            request(req, function(error, response, body) {
                if (response.statusCode === 200) {
                    myLogger.info('Reading posted:' + sensor.sensors[0].name + ' temp:'  + reading.sensors[0].temp + ' humiduty:' + reading.sensors[0].hum);
                } else {
                    myLogger.error(response.statusCode);
                    myLogger.error(body);
                }
            });

            setTimeout(function() {
                sensor.read();
            }, 60000);
        } else {

            myLogger.warn('Bad reading : restarting');
            setTimeout(function() {
                sensor.read();
            }, 10000);
        };
    }
};

sensor.read();
