'use strict';

const kitx = require('kitx');
const auth = require('basic-auth');

module.exports = () => {
  return async function(ctx, next) {
    const { service: { mysql } } = ctx;

    const credentials = auth(ctx.req);
    if (!credentials) {
      ctx.status = 401;
      ctx.set('www-authenticate', 'basic realm="easy-monitor"');
      ctx.body = 'access denied';
    } else {
      const { name, pass } = credentials;
      const saltPass = kitx.md5(pass, 'hex');

      // save user first time
      const user = await mysql.getUserByName(name);
      if (!user) {
        const identity = parseInt((Math.random() * 9 + 1) * 10e4);
        const res = await mysql.saveUser(name, saltPass, identity);
        ctx.user = {
          userId: res.insertId,
          name,
        };
        return await next();
      }

      // check pass success
      if (user.pass === saltPass) {
        ctx.user = {
          userId: user.id,
          name: user.name,
        };
        return await next();
      }

      // auth failed
      ctx.status = 401;
      ctx.body = 'name or password wrong, access denied';
    }
  };
};
