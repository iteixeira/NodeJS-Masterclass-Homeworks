/**
 * Handlers file
 */

// Dependencies
const _users = require('./users');
const _access = require('./access-control');
const _delivery = require('./pizza-delivery');

// Define the handlers
const handlers = {};

handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.includes(data.method)) {
    _users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers.login = (data, callback) => {
  if (data.method === 'post') {
    _access.login(data, callback);
  } else {
    callback(405);
  }
};

handlers.logout = (data, callback) => {
  if (data.method === 'get') {
    _access.logout(data, callback);
  } else {
    callback(405);
  }
};

handlers.items = (data, callback) => {
  if (data.method === 'get') {
    _delivery.listMenus(data, callback);
  } else {
    callback(405);
  }
};

handlers.addToCart = (data, callback) => {
  if (data.method === 'post') {
    _delivery.addToShoopingCart(data, callback);
  } else {
    callback(405);
  }
};

handlers.createOrder = (data, callback) => {
  if (data.method === 'get') {
    _delivery.createOrder(data, callback);
  } else {
    callback(405);
  }
};

module.exports = handlers;
