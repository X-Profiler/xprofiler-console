'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async index() {
    const { ctx } = this;
    const { nick } = ctx.user;

    ctx.body = { ok: true, data: { name: nick } };
  }
}

module.exports = UserController;
