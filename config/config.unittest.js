'use strict';

module.exports = () => {
  const config = {};

  const password = process.env.MYSQL_ROOT_PASSWORD || 'root';

  config.mysql = {
    app: true,
    agent: false,
    clients: {
      xprofiler_console: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password,
        database: 'xprofiler_console_unittest',
      },
      xprofiler_logs: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password,
        database: 'xprofiler_logs_unittest',
      },
    },
  };

  config.redis = {
    client: {
      sentinels: null,
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    },
  };

  config.xprofilerConsole = 'http://127.0.0.1:8443';

  config.xtransitManager = 'http://127.0.0.1:8543';

  return config;
};
