// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Container for the users submethods
_users = {};

// Users - POST
// Required parameters: name, email, street address and password
_users.post = (data, callback) => {
  const name =
    typeof data.payload.name === 'string' && data.payload.name.trim().length > 0
      ? data.payload.name.trim()
      : false;
  const email =
    typeof data.payload.email === 'string' &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;
  const streetAddress =
    typeof data.payload.streetAddress === 'string' &&
    data.payload.streetAddress.trim().length > 0
      ? data.payload.streetAddress.trim()
      : false;
  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (name && email && streetAddress && password) {
    // Make sure that the users doesn't already exist
    _data.read('users', email, (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // Create the user object
          const userObj = {
            name,
            email,
            streetAddress,
            hashedPassword
          };

          // Store the user
          _data.create('users', email, userObj, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { error: 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { error: `Could not hash the user's password` });
        }
      } else {
        callback(400, { error: 'A user with that email already exists' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// Users - PUT
// Required fields: email
// Optional fields: name, streetAddress and password
_users.put = (data, callback) => {
  // Check for the required field
  const email =
    typeof data.payload.email === 'string' &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;

  // Check for the optional fields
  const name =
    typeof data.payload.name === 'string' && data.payload.name.trim().length > 0
      ? data.payload.name.trim()
      : false;
  const streetAddress =
    typeof data.payload.streetAddress === 'string' &&
    data.payload.streetAddress.trim().length > 0
      ? data.payload.streetAddress.trim()
      : false;
  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (email && (name || streetAddress || password)) {
    // Read the user from storage
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        // Update the fields necessary
        if (name) {
          userData.name = name;
        }

        if (streetAddress) {
          userData.streetAddress = streetAddress;
        }

        if (password) {
          userData.hashedPassword = helpers.hash(password);
        }

        _data.update('users', email, userData, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { error: 'Could not update the user' });
          }
        });
      } else {
        callback(400, { error: 'The specified user does not exist' });
      }
    });
  } else {
    callback(400, { error: 'Missing required field' });
  }
};

// Users - DELETE
// Required parameter: email
_users.delete = (data, callback) => {
  // Chech that the email is valid
  const email =
    typeof data.queryStringObject.email === 'string' &&
    data.queryStringObject.email.trim().length > 0
      ? data.queryStringObject.email.trim()
      : false;

  if (email) {
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        _data.delete('users', email, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { error: 'Could not delete the specified user' });
          }
        });
      } else {
        callback(400, { error: 'Could not find the specified user' });
      }
    });
  } else {
    callback(400, { error: 'Missing required field' });
  }
};

module.exports = _users;
