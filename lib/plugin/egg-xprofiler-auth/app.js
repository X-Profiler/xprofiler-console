'use strict';

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configDidLoad() {
    const { appMiddleware } = this.app.config;
    appMiddleware.unshift('basicAuth');
  }
}

module.exports = AppBootHook;
