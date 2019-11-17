/**
 * Access control file
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Container for all access-control methods
const _access = {};

// Access Control - LOGIN
// Required fields: email and password
_access.login = (data, callback) => {
  // Check required fields
  const email =
    typeof data.payload.email === 'string' &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;
  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (email && password) {
    // Lookup the user who matches that email
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        // Hash the sent password, and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            email,
            id: tokenId,
            expires
          };

          _data.create('tokens', tokenId, tokenObject, err => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { error: 'Could not create the new token' });
            }
          });
        } else {
          callback(400, {
            error: 'Password did not match the specified stored password'
          });
        }
      } else {
        callback(400, { error: 'Could not find the specified user' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// Access Control - LOGOUT
// Required parameter: id
_access.logout = (data, callback) => {
  const id =
    typeof data.queryStringObject.id === 'string' &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id
      : false;

  if (id) {
    // Check if the file exists
    _data.read('tokens', id, (err, data) => {
      _data.delete('tokens', id, err => {
        if (!err) {
          callback(200);
        } else {
          callback(500, { error: 'Could not delete the specified token' });
        }
      });
    });
  } else {
    callback(400, { error: 'Missing required field' });
  }
};

_access.verifyToken = (id, callback) => {
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = _access;
