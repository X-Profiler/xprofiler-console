'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    await ctx.render('index');
  }
}

module.exports = HomeController;
