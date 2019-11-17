/**
 * Pizza delivery functions
 */

// Dependencies
const tokens = require('./access-control');
const cart = require('./cart');
const helpers = require('./helpers');
const _data = require('./data');

// Container to all pizza delivery functions
const _delivery = {};

// Pizza delivery - GET
_delivery.listMenus = (data, callback) => {
  // Get the token from the headers
  const token = typeof data.headers.token === 'string' ? data.headers.token : false;

  // Verify that the given token is valid
  tokens.verifyToken(token, isValid => {
    if (isValid) {
      callback(200, { items: _delivery.menuItems });
    } else {
      callback(403);
    }
  });
};

// Add to shopping cart - POST
// Required parameters: items
_delivery.addToShoopingCart = (data, callback) => {
  // Get the token from the headers
  const token = typeof data.headers.token === 'string' ? data.headers.token : false;

  // Verify that the given token is valid
  tokens.verifyToken(token, isValid => {
    if (isValid) {
      const items =
        typeof data.payload.items === 'object' &&
        data.payload.items instanceof Array &&
        data.payload.items.length > 0 &&
        !data.payload.items.find(
          item => !item['id'] || !_delivery.menuItems.find(menuItem => menuItem.id === item['id'])
        )
          ? data.payload.items
          : false;

      if (items) {
        items.forEach(item => {
          const selected = _delivery.menuItems.find(menuItem => menuItem.id === item.id);
          cart.addToCart(token, selected, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { error: err });
            }
          });
        });
      } else {
        callback(400, { error: 'Missing required field(s)' });
      }
    } else {
      callback(403);
    }
  });
};

// Create an order
_delivery.createOrder = (data, callback) => {
  // Get the token from the headers
  const token = typeof data.headers.token === 'string' ? data.headers.token : false;

  // Verify that the given token is valid
  tokens.verifyToken(token, isValid => {
    if (isValid) {
      // Get the cart
      cart.getCart(token, (err, cartData) => {
        if (!err && cartData) {
          if (cartData.items.length > 0) {
            // Calculate the amount value
            const amount = cartData.items.reduce((acc, curr) => acc + curr.value, 0) * 100;
            // Send the payment request via Stripe
            helpers.sendStripePayment(amount, (err, stripeData) => {
              if (!err && stripeData) {
                // Send the receipt to the client via Mailgun
                const receiptUrl =
                  stripeData['charges'] &&
                  stripeData['charges']['data'] &&
                  stripeData['charges']['data'].length > 0 &&
                  typeof stripeData['charges']['data'][0]['receipt_url'] === 'string' &&
                  stripeData['charges']['data'][0]['receipt_url'].trim().length > 0
                    ? stripeData['charges']['data'][0]['receipt_url']
                    : false;

                if (receiptUrl) {
                  // Load the token file to get the user's email
                  _data.read('tokens', token, (err, tokenData) => {
                    if (!err && tokenData) {
                      // Get the destination email
                      const destination = tokenData.email;
                      helpers.sendMail(
                        destination,
                        'Receipt',
                        `Your receipt from Pizza Delivery: ${receiptUrl}`,
                        err => {
                          if (!err) {
                            callback(false);
                          } else {
                            callback(500, { error: `Problems to send the receipt email: ${err}` });
                          }
                        }
                      );
                    } else {
                      callback(500, { error: 'Could not find the token file' });
                    }
                  });
                } else {
                  callback(500, { error: 'The receipt URL was not found' });
                }
              } else {
                console.log(err);
                callback(500, { error: `Could not create and confirm the payment at Stripe` });
              }
            });
          } else {
            callback(400, { error: 'There is any items in the cart' });
          }
        } else {
          callback(500, { error: 'Could not get the cart' });
        }
      });
    } else {
      callback(403);
    }
  });
};

_delivery.menuItems = [
  { id: 1, description: 'Margherita', value: 10 },
  { id: 2, description: 'Funghi', value: 20 },
  { id: 3, description: 'Cheesee', value: 15 }
];

module.exports = _delivery;
