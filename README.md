# pi-fridge-logger
Node application to log from multiple sensors into a remote rest server

Needs bcm2835 library installed first

$ tar zxvf bcm2835-1.xx.tar.gz
$ cd bcm2835-1.xx
$ ./configure
$ make
$ sudo make check
$ sudo make install

Then

```
$ npm install
$ npm install pm2
```

http://www.airspayce.com/mikem/bcm2835/

Deploy then run npm install

Enviromment in .env (SERVER=, PORT =)
Run via PM2

```
$ pm2 index.js
```
Logging to console and papertrail via winston

## Testing

Run json-server on mac.
Confirm .env points to mac.
Run via
```
$ node index.js
```

## Production concerns

### Add PM2 log to papertrail

/root/.pm2/pm2.log into
/etc/log_files.yml

## Environment Variables

Contained in the .env file

SERVER and PORT to point to the rest server.
API_KEY is the Forecast.io weather key.

## Testing Framework

The module testing.js is to create test data from a non-pi device. This will simulate the raspberry pi taking readings and posting them to the fridge controller server rest services. Run as below, or using pm2.

```
$ node testing.js
```

