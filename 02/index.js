/**
 * Init file
 */

// Dependencies
const server = require('./lib/server');

// Declare the app
const app = {};

// Init function
app.init = () => {
  // Start the server
  server.init();
};

// Execute
app.init();
