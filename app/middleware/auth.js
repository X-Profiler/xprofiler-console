'use strict';

module.exports = () => {
  return {
    async userRequired(ctx, next) {
      if (ctx.user) {
        await next();
      } else {
        // const { app } = ctx;
        // if (app.isAjax(ctx.headers)) {
        //   ctx.body = { ok: false, message: 'login first', code: 403 };
        // } else {
        //   ctx.redirect('/403');
        // }
        ctx.body = { ok: false, message: 'login first', code: 401 };
      }
    },
  };
};
