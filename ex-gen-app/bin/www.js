#!/usr/bin/env node

/**
 * モジュールの依存関係
 */

var app = require('../app');
var debug = require('debug')('ex-gen-app:server');
var http = require('http');
const { sequelize } = require('../models');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log('Listening on ' + bind);
  console.log('Open http://localhost:' + addr.port + ' in your browser');
  console.log('Press Ctrl+C to stop the server');
}

/**
 * DBを初期化してサーバーを起動
 */
async function startServer() {
  try {
    // リクエストの待機を開始
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
  } catch (error) {
    console.error('Unable to start the server:', error);
    process.exit(1);
  }
}

startServer();
