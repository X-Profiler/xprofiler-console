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

  config.development = {
    watchDirs: ['lib'],
  };

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

  config.security = {
    csrf: {
      ignore: [
        '/xapi/upload_from_xtransit',
      ],
    },
  };

  config.multipart = {
    fileSize: '4096mb',
    fileExtensions: [
      '.cpuprofile',
      '.heapprofile',
      '.gcprofile',
      '.heapsnapshot',
      '.diag',
      '.core',
      '.node',
      '.trend',
    ],
    mode: 'file',
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

  config.profilingTimeExtra = 60 * 1000;

  config.profilingTimeExpired = 120 * 1000;

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
    core: {
      profilingTime: config.profilingTimeExtra,
      expired: config.profilingTimeExpired,
    },
  };

  config.uploadFileExpiredTime = 20 * 60 * 1000;

  config.auditExpiredTime = 15 * 1000;

  config.uploadNoncePrefix = 'XTRANSIT_UPLOAD_NONCE::';

  const userConfig = {};

  // async config
  userConfig.remoteConfig = {
    async handler(/* agent */) {
      // will override app.config
      return {
        // async config, eg:
        // mysql: { clients:{ xprofiler_console: { port: 3390 } } }
      };
    },
  };

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
