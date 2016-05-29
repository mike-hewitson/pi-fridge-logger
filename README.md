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
```

http://www.airspayce.com/mikem/bcm2835/

Deploy then run npm install

Enviromment in .env (SERVER=, PORT =)
Run via PM2

```
$ node index.js
```
Logging to console and papertrail via winston

## Testing

Run json-server on mac.
Confirm .env points to mac.
Run via
```
$ node index.js
```

