const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

// Container for all the helpers
const helpers = {};

helpers.hash = str => {
  if (typeof str == 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

helpers.parseJsonToObject = str => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

helpers.createRandomString = strLength => {
  strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;

  if (strLength) {
    const possibleCharacters = 'abcdefghijklmonpqrstuvwxyz0123456789';
    let str = '';

    for (let i = 1; i <= strLength; i++) {
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
};

// Create and confirm a payment via Stripe
helpers.sendStripePayment = (amount, callback) => {
  const payload = {
    amount,
    currency: config.stripe.currency,
    'payment_method_types[]': 'card',
    confirm: true,
    payment_method: 'pm_card_visa'
  };

  // Stringify the payload
  const stringPayload = querystring.stringify(payload);

  // Configure the request details
  const requestDetails = {
    method: 'POST',
    hostname: 'api.stripe.com',
    path: '/v1/payment_intents',
    headers: {
      Authorization: `Bearer ${config.stripe.secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    }
  };

  // Instantiate the request object
  const req = https.request(requestDetails, res => {
    const chunks = [];

    res.on('data', function(chunk) {
      // Add 'data' to chunks
      chunks.push(chunk);
    });

    res.on('end', function() {
      // Concat the chunks
      const body = Buffer.concat(chunks);

      // Grab the status of the sent request
      const status = res.statusCode;
      // Callback successfully
      if (status === 200) {
        callback(false, JSON.parse(body));
      } else {
        callback(`Status code returned was ${status} because of: ${body}`);
      }
    });
  });

  req.on('error', e => callback(e));
  req.write(stringPayload);
  req.end();
};

// Send email via Mailgun
helpers.sendMail = (destination, subject, msg, callback) => {
  // Build the mail payload
  const payload = {
    from: config.mailgun.from,
    to: destination,
    subject,
    text: msg
  };

  // Stringify the payload
  const stringPayload = querystring.stringify(payload);

  // Build the basic authorization in base64
  const userPassword = `${config.mailgun.user}:${config.mailgun.key}`;
  const buffer = new Buffer(userPassword);
  const base64 = buffer.toString('base64');

  // Configure the request details
  const requestDetails = {
    method: 'POST',
    hostname: 'api.mailgun.net',
    path: '/v3/sandbox4ea1a7ae54944a19a4de27cb65817091.mailgun.org/messages',
    headers: {
      Authorization: `Basic ${base64}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    }
  };

  // Instantiate the request object
  const req = https.request(requestDetails, res => {
    const chunks = [];

    res.on('data', function(chunk) {
      // Add 'data' to chunks
      chunks.push(chunk);
    });

    res.on('end', function() {
      // Concat the chunks
      const body = Buffer.concat(chunks);

      // Grab the status of the sent request
      const status = res.statusCode;
      // Callback successfully
      if (status === 200) {
        callback(false);
      } else {
        callback(`Status code returned was ${status} because of: ${body}`);
      }
    });
  });

  req.on('error', e => callback(e));
  req.write(stringPayload);
  req.end();
};

module.exports = helpers;
