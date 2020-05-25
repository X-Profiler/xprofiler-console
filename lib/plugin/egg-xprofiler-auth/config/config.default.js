'use strict';

module.exports = () => {
  const config = exports = {};

  config.basicAuth = {
    ignore: [
      '/xapi/upload_from_xtransit',
    ],
  };

  return config;
};
