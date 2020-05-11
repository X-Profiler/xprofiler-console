'use strict';

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
};
