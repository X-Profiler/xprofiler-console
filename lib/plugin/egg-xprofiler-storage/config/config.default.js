'use strict';

const path = require('path');

module.exports = appInfo => {
  const config = exports = {};

  config.storagePath = path.join(appInfo.baseDir, 'profiler');

  return config;
};
