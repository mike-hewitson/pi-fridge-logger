require('dotenv').config();
var sensorLib = require('node-dht-sensor');
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

// var sensorLib = require("node-dht-sensor");

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
        // var forecastIo = new ForecastIo('62888a9ff1907377b60a866701cf3338');
        var forecastIo = new ForecastIo(process.env.API_KEY);

        forecastIo.forecast('-26.124', '28.027', options).then(function(data) {
            myLogger.info(data.currently.temperature);
            myLogger.info(data.currently.humidity * 100);
            // myLogger.info(JSON.stringify(environment));
            var reading = { date: new Date(), sensors: [] };

            reading.sensors.push({ sensor: 'Environment', temp: data.currently.temperature.toFixed(1), hum: (data.currently.humidity * 100).toFixed(1) });

            for (var a in sensor.sensors) {
                var b = sensorLib.readSpec(sensor.sensors[a].type, sensor.sensors[a].pin);
                reading.sensors.push({ sensor: sensor.sensors[a].name, temp: b.temperature.toFixed(1), hum: b.humidity.toFixed(1) });
            }

            myLogger.info(reading);
            // myLogger.info(uri);
            var req = {
                url: url,
                method: "POST",
                // json: true,
                headers: {
                    "content-type": "application/json",
                },
                json: reading
                    // json: { a:"some crap"}
            };
            // var req = {
            //     uri: uri,
            //     'content-type': 'application/json',
            //     body: JSON.stringify(reading)
            // };
            myLogger.info(req);


            request(req, function(error, response, body) {
                // myLogger.info(error);
                // myLogger.info(response);
                // myLogger.info(body);
                if (response.statusCode == 201) {
                    myLogger.info('document saved')
                } else {
                    // myLogger.error(req);
                    myLogger.error(response.statusCode);
                    myLogger.error(body);
                }
            });

        });

            setTimeout(function() {
                sensor.read();
            }, 300000);

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
