/**
 * Cart file
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Container for all cart methods
const _cart = {};

// Add to ther user's cart
// Required parameters: id and item
_cart.addToCart = (id, item, callback) => {
  _cart.getCart(id, (err, cartData) => {
    if (!err && cartData) {
      if (!cartData.items.find(obj => obj.id === item.id)) {
        cartData.items.push(item);
      }
      _data.update('carts', `cart-${id}`, cartData, err => {
        if (!err) {
          callback(false);
        } else {
          callback(err);
        }
      });
    } else {
      callback('Error to create the cart');
    }
  });
};

// Get the cart. If the cart does not exists, this will create it.
// Required paramenters: id
_cart.getCart = (id, callback) => {
  const fileName = `cart-${id}`;
  _data.read('carts', fileName, (err, cartData) => {
    if (!err && cartData) {
      callback(false, cartData);
    } else {
      const cartObj = {
        id,
        items: []
      };
      _data.create('carts', fileName, cartObj, err => {
        if (!err) {
          callback(false, cartObj);
        } else {
          callback('Error to create the cart file');
        }
      });
    }
  });
};

module.exports = _cart;
