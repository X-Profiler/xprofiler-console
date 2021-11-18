'use strict';

const path = require('path');

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },

  mysql: {
    enable: true,
    package: 'egg-mysql',
  },

  redis: {
    enable: true,
    package: 'egg-redis',
  },

  remoteConfig: {
    enable: true,
    package: 'egg-remote-config',
  },

  // xprofiler plugin
  xauth: {
    enable: true,
    path: path.join(__dirname, '../lib/plugin/egg-xprofiler-auth'),
  },

  xstorage: {
    enable: true,
    path: path.join(__dirname, '../lib/plugin/egg-xprofiler-storage'),
  },
};
