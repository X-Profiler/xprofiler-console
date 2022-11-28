'use strict';

const path = require('path');
const egg = require('egg');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

class AppWorkerLoader extends egg.AppWorkerLoader {
  load() {
    super.load();
    const directory = path.join(__dirname, 'app');
    super.loadController({ directory: path.join(directory, 'controller') });
    super.loadFile(path.join(directory, 'router'))
  }
}

class Application extends egg.Application {
  get [EGG_LOADER]() {
    return AppWorkerLoader;
  }

  get [EGG_PATH]() {
    return __dirname;
  }
}

module.exports = Object.assign(egg, {
  Application,
  AppWorkerLoader,
});