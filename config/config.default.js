/* eslint valid-jsdoc: "off" */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  config.keys = appInfo.name + '_1588763657594_4897';

  config.middleware = [
    'basicAuth',
  ];

  config.static = {
    gzip: true,
  };

  config.siteFile = {
    '/favicon.ico': fs.readFileSync(path.join(__dirname, '../app/public/favicon.ico')),
  };

  config.view = {
    mapping: {
      '.html': 'nunjucks',
    },
  };

  config.secure = {
    secret: 'easy-monitor::xprofiler',
  };

  config.httpTimeout = 15000;

  config.profilingTime = {
    start_cpu_profiling: 5 * 60 * 1000,
    start_heap_profiling: 5 * 60 * 1000,
    start_gc_profiling: 5 * 60 * 1000,
  };

  config.profilingTimeExtra = 15 * 1000;

  config.profilingTimeExpired = 60 * 1000;

  config.actionTime = {
    cpuprofile: {
      profilingTime: config.profilingTime.start_cpu_profiling + config.profilingTimeExtra,
      expired: config.profilingTime.start_cpu_profiling + config.profilingTimeExpired,
    },
    heapprofile: {
      profilingTime: config.profilingTime.start_heap_profiling + config.profilingTimeExtra,
      expired: config.profilingTime.start_heap_profiling + config.profilingTimeExpired,
    },
    gcprofile: {
      profilingTime: config.profilingTime.start_gc_profiling + config.profilingTimeExtra,
      expired: config.profilingTime.start_gc_profiling + config.profilingTimeExpired,
    },
    heapsnapshot: {
      profilingTime: config.profilingTimeExtra,
      expired: config.profilingTimeExpired,
    },
    diag: {
      profilingTime: config.profilingTimeExtra,
      expired: config.profilingTimeExpired,
    },
  };

  config.uploadFileExpiredTime = 20 * 60 * 1000;

  const userConfig = {};

  // mysql
  userConfig.mysql = {
    app: true,
    agent: false,
    clients: {
      xprofiler_console: {
        host: '',
        port: 3306,
        user: '',
        password: '',
        database: 'xprofiler_console',
      },
      xprofiler_logs: {
        host: '',
        port: 3306,
        user: '',
        password: '',
        database: 'xprofiler_logs',
      },
    },
  };

  // redis
  userConfig.redis = {
    client: {
      sentinels: null,
      port: 6379,
      host: '',
      password: '',
      db: 0,
    },
  };

  // xtransit upload file
  userConfig.xprofilerConsole = '';

  // xtransit manager
  userConfig.xtransitManager = '';

  return {
    ...config,
    ...userConfig,
  };
};
