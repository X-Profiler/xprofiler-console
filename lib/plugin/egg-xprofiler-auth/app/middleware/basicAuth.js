'use strict';

const kitx = require('kitx');
const auth = require('basic-auth');

module.exports = () => {
  return async function(ctx, next) {
    if (ctx.user) return await next();

    const { service: { mysql } } = ctx;

    const credentials = auth(ctx.req);
    if (!credentials) {
      ctx.status = 401;
      ctx.set('www-authenticate', 'basic realm="easy-monitor"');
      ctx.body = 'access denied';
    } else {
      // name must be mail address
      const { name, pass } = credentials;
      if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(name)) {
        ctx.status = 401;
        ctx.body = '请使用邮箱注册或者登陆';
        return;
      }

      // save user first time
      const saltPass = kitx.md5(pass, 'hex');
      const user = await mysql.getUserByName(name);
      if (!user) {
        const identity = parseInt((Math.random() * 9 + 1) * 10e4);
        const nick = name.replace(/@.*/, '');
        const mail = name;
        const res = await mysql.saveUser(name, nick, saltPass, identity, mail);
        ctx.user = {
          userId: res.insertId,
          name, nick, mail,
        };
        return await next();
      }

      // check pass success
      if (user.pass === saltPass) {
        ctx.user = {
          userId: user.id,
          name: user.name,
          nick: user.nick,
          mail: user.mail,
        };
        return await next();
      }

      // auth failed
      ctx.status = 401;
      ctx.body = '用户名或者密码错误，登陆失败';
    }
  };
};
