'use strict';

var bodyParser = require('body-parser');
var ejs = require('ejs');
var express = require('express');
var http = require('http');
var path = require('path');

// use graceful-fs instead of the standard fs library
// because it is an improved version of fs
// and should be able to handle errors like "EMFILE Too many open files"
var fs = require('fs');
var gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);

var misc = require('./misc.js');

// prepend all console messages with timestamps
// example: 2015-01-16 22:29:55 GMT+0000 (UTC) This is a log message success="true" host="LAX TERM 1"
// format: YYYY-mm-dd HH:MM:SS
var console_ten = require('console-ten');
console_ten.init(console, console_ten.LEVELS.ALL, function(){
    return '[' + misc.get_formatted_timestamp() + '] ';
});

var home = require('./routes/home');

var app = express();
var port = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view cache', true);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('.html', ejs.__express);

app.use('/', home);

// catch 404 and forward to error handler
app.use(function(req, res)
{
    console.error('404 not found. url="%s"', req.originalUrl);
    res.sendStatus(404);
});

// needed for Nginx
app.enable('trust proxy');

/**
 * Create HTTP server.
 */
var server = http.createServer(app);
server.listen(3000);
server.on('error', onError);
server.on('listening', onListening);

console.log('HTTP server started.');

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error)
{
    if (error.syscall !== 'listen')
    {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code)
    {
        case 'EACCES':
            console.error(port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(port + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening()
{
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
