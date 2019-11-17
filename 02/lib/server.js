/**
 * Server file
 */

const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const util = require('util');
const handlers = require('./handlers');
const helpers = require('./helpers');
const config = require('./config');

const server = {};
const debug = util.debuglog('server');

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
  // Get the URL and parse it
  const parsedURL = url.parse(req.url, true);

  // Get the path
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const queryStringObject = parsedURL.query;

  // Get the HTTP request
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => (buffer += decoder.write(data)));

  req.on('end', () => {
    buffer += decoder.end();

    const chooseHandler =
      typeof server.router[trimmedPath] !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer)
    };

    chooseHandler(data, (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 200;
      payload = JSON.stringify(typeof payload === 'object' ? payload : {});

      // Send the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payload);

      debug('Returning this response: ', statusCode, payload);
    });
  });
});

server.router = {
  users: handlers.users,
  login: handlers.login,
  logout: handlers.logout,
  items: handlers.items,
  add: handlers.addToCart,
  'create-order': handlers.createOrder
};

server.init = () => {
  server.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[36m%s\x1b[0m', `The server is listening on port 3000.`);
  });
};

module.exports = server;
