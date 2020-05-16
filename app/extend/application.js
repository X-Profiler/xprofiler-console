'use strict';

const kitx = require('kitx');
const crypto = require('crypto');
const { v4 } = require('uuid');

module.exports = {
  isAjax(headers) {
    const accept = headers.accept || '';
    return accept.includes('application/json');
  },

  randomStr() {
    return `${Math.random().toString(16).substr(2)}::${Date.now()}`;
  },

  createAppSecret(userId, appName) {
    const rawSecret = `${userId}::${appName}::${v4()}::${this.randomStr()}`;
    const secret = kitx.md5(rawSecret, 'hex');
    return secret;
  },

  sign(message, secret) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    return crypto.createHmac('sha1', secret).update(message).digest('hex');
  },
};
