'use strict';

const fs = require('fs');
const { promisify } = require('util');
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async configDidLoad() {
    const { storagePath } = this.app.config;
    if (!await exists(storagePath)) {
      await mkdir(storagePath, { recursive: true });
    }
  }
}

module.exports = AppBootHook;
