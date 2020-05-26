'use strict';

const path = require('path');
const kitx = require('kitx');
const crypto = require('crypto');
const moment = require('moment');
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

  isNumber(num) {
    return num !== true && num !== false && Boolean(num === 0 || (num && !isNaN(num)));
  },

  formatSize(size, fixed = 2) {
    let str = '';
    size = +size;

    if (size / 1024 < 1) {
      str = `${Number((size).toFixed(fixed))}Bytes`;
    } else if (size / 1024 / 1024 < 1) {
      str = `${Number((size / 1024).toFixed(fixed))}KB`;
    } else if (size / 1024 / 1024 / 1024 < 1) {
      str = `${Number((size / 1024 / 1024).toFixed(fixed))}MB`;
    } else {
      str = `${(Number(size / 1024 / 1024 / 1024).toFixed(fixed))}GB`;
    }
    return str;
  },

  getPeriods(period, formatter = 'YYYY-MM-DD HH:mm:ss') {
    const end = Date.now();
    const start = end - period * 60 * 1000;
    const list = [];
    let tmp = start;
    while (moment(tmp).startOf('day') < end) {
      list.push({
        date: moment(tmp).format('DD'),
        start: moment(tmp).format(formatter),
        end: moment(end).format('YYYYMMDD') === moment(tmp).format('YYYYMMDD') ?
          moment(end).format(formatter) : moment(tmp).endOf('day').format(formatter),
      });
      tmp = moment(tmp).startOf('day').add(1, 'days');
    }
    return list;
  },

  modifyFileName(fileName) {
    const regexp = /^u-.*-u-(.*)$/;
    // storage
    if (regexp.test(fileName)) {
      const [, name] = regexp.exec(fileName);
      return name;
    }

    // file path1
    const uploadName = path.basename(fileName);
    if (uploadName !== fileName) {
      return uploadName;
    }

    // file path2
    const regexp2 = /(x-.*\..*)/;
    if (regexp2.exec(fileName)) {
      const [, name] = regexp2.exec(fileName);
      return name;
    }

    return fileName;
  },
};
