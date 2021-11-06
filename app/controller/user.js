'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async index() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { nick, userId } = ctx.user;

    const [{ identity }] = await mysql.getUserByUserIds([userId]);

    ctx.body = { ok: true, data: { name: nick, id: identity } };
  }
}

module.exports = UserController;
