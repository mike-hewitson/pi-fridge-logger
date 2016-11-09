"use strict";

require('dotenv').config();
var request = require('request');
var ForecastIo = require('forecastio');
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
            host: 'logs4.papertrailapp.com',
            port: 32583,
            program: 'pi-logger',
            colorize: true
        })
    ]
});

var url = 'http://' + process.env.SERVER + ':' + process.env.PORT + '/readings';

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
        var options = {
            exclude: 'hourly,daily,flags',
            units: 'si'
        };
        var forecastIo = new ForecastIo(process.env.API_KEY);

        forecastIo.forecast('-26.124', '28.027', options).then(function(data) {
            var reading = { date: new Date(), sensors: [] };

            reading.sensors.push({ sensor: 'Environment', temp: data.currently.temperature.toFixed(1), hum: (data.currently.humidity * 100).toFixed(1) });
            reading.sensors.push({ sensor: 'Ambient', temp: data.currently.temperature.toFixed(1), hum: (data.currently.humidity * 100).toFixed(1) });
            reading.sensors.push({ sensor: 'Curing', temp: data.currently.temperature.toFixed(1), hum: (data.currently.humidity * 100).toFixed(1) });
            reading.sensors.push({ sensor: 'Fridge', temp: data.currently.temperature.toFixed(1), hum: (data.currently.humidity * 100).toFixed(1) });

            // if (valid_readings) {
            myLogger.debug(reading);

            var req = {
                url: url,
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                json: reading
            };

            myLogger.info(req);

            request(req, function(error, response, body) {
                if (response.statusCode === 201) {
                    myLogger.info('document saved');
                } else {
                    myLogger.error(response.statusCode);
                    myLogger.error(body);
                }
            });

            setTimeout(function() {
                sensor.read();
            }, 300000);
            // } else {

            //     myLogger.warn('Zero reading : restarting');
            //     setTimeout(function() {
            //         sensor.read();
            //     }, 10000);
            // }
        });



    }
};

sensor.read();
