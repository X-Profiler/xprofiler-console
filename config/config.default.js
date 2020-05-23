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

  config.actionTime = {
    cpuprofile: {
      profilingTime: config.profilingTime.start_cpu_profiling,
      expired: config.profilingTime.start_cpu_profiling + 50 * 1000,
    },
    heapprofile: {
      profilingTime: config.profilingTime.start_heap_profiling,
      expired: config.profilingTime.start_heap_profiling + 50 * 1000,
    },
    gcprofile: {
      profilingTime: config.profilingTime.start_gc_profiling,
      expired: config.profilingTime.start_gc_profiling + 50 * 1000,
    },
    heapsnapshot: {
      profilingTime: 10 * 1000,
      expired: 30 * 1000,
    },
    diag: {
      profilingTime: 5 * 1000,
      expired: 30 * 1000,
    },
  };

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

  // xtransit manager
  userConfig.xtransitManager = '';

  return {
    ...config,
    ...userConfig,
  };
};
