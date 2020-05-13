'use strict';

module.exports = () => {
  return {
    checkParams(keys) {
      return async function userRequired(ctx, next) {
        if (!ctx.checkPossibleParams(keys)) {
          return;
        }
        await next();
      };
    },
  };
};
